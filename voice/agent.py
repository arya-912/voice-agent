"""LiveKit worker: one job == one outbound recovery call.

Run:
    python -m voice.agent dev        # against a dev LiveKit server
    python -m voice.agent start      # production worker (registers as
                                     # agent_name so the dialer can
                                     # explicitly dispatch to it)

Job metadata is JSON: a serialised FailureEvent plus
  "_call": {"attempt_number": N, "merchant": "...", "dial": true}
When "dial" is set and SIP_OUTBOUND_TRUNK_ID is configured, the agent
rings the customer in over the outbound SIP trunk; otherwise it just
waits for someone to join the room (dev / console testing).

"demo": true marks a website demo call (voice/demo.py): the "customer"
is a browser visitor in the room, never a phone. The customer-protection
stopping rules don't apply to a visitor who started the call themselves;
the call is shorter, not recorded, and tool calls + the outcome are
published to the room so the website can show them.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os

from dotenv import load_dotenv

# Import LiveKit + the Google plugin at module level: plugins must register
# on the process main thread, which happens here, not inside the job task.
from google.genai import types as genai_types
from livekit import api
from livekit.agents import AgentSession, WorkerOptions, cli
from livekit.plugins.google.beta import realtime

from audit import db
from audit.log import append_event
from data.schemas import FailureEvent
from decision.stopping_rules import check_stopping_rules
from voice import config
from voice import demo as demo_mod
from voice.call_logging import per_call_log_file, setup_worker_logging
from voice.dialer import dial_sip_participant
from voice.flow import RecoveryAgent
from voice.outcome import write_call_audit
from voice.recording import recording_url, start_recording, stop_recording
from voice.turn_timing import TurnTimer

load_dotenv()
setup_worker_logging()
logger = logging.getLogger("voice.agent")

AGENT_NAME = os.environ.get("LIVEKIT_AGENT_NAME", "razorcovery-agent")


def _parse_metadata(raw: str) -> tuple[FailureEvent, int, str, bool, bool]:
    data = json.loads(raw)
    meta = data.pop("_call", {})
    event = FailureEvent.model_validate(data)
    return (
        event,
        int(meta.get("attempt_number", event.prior_attempts + 1)),
        meta.get("merchant", "the merchant"),
        bool(meta.get("dial", False)),
        bool(meta.get("demo", False)),
    )


def _publisher(ctx, topic: str):
    """Fire-and-forget JSON publish to the room (website demo only)."""
    pending: set[asyncio.Task] = set()

    def publish(payload: dict) -> asyncio.Task | None:
        try:
            task = asyncio.get_running_loop().create_task(
                ctx.room.local_participant.publish_data(
                    json.dumps(payload), reliable=True, topic=topic))
        except Exception as exc:  # noqa: BLE001
            logger.warning("could not publish %s: %s", topic, exc)
            return None
        pending.add(task)
        task.add_done_callback(pending.discard)
        return task

    return publish


async def entrypoint(ctx) -> None:  # ctx: livekit.agents.JobContext
    from datetime import datetime, timezone

    event, attempt_number, merchant, should_dial, is_demo = _parse_metadata(ctx.job.metadata or "{}")
    should_dial = should_dial and not is_demo  # a demo never rings a phone

    with per_call_log_file(event.event_id):
        logger.info("call starting: event=%s attempt=%d merchant=%s dial=%s demo=%s",
                    event.event_id, attempt_number, merchant, should_dial, is_demo)

        # Never dial past a stopping rule, even if the dispatcher already checked.
        # (A demo call is a visitor talking to the agent, not a customer being
        # contacted -- it has no attempts, refusals or call window to honour.)
        stop = None if is_demo else check_stopping_rules(
            attempts=event.prior_attempts, refused=event.refused,
            timezone=event.customer.timezone, now=datetime.now(timezone.utc),
            intervention="voice",
        )
        if stop is not None and stop.blocked:
            logger.warning("call aborted by stopping rule: %s", stop.rule)
            with db.get_conn() as conn:
                append_event(
                    conn, event_id=event.event_id, customer_id=event.customer.id,
                    entry_type="stopping_rule_triggered", failure_type=event.failure_type,
                    intervention="voice",
                    reason=f"[{stop.rule}] {stop.reason} (checked at dial time)",
                    payload={"rule": stop.rule, "stage": "agent_entrypoint",
                             "blocks_all_contact": stop.blocks_all_contact},
                )
            return

        await ctx.connect()
        started_at = datetime.now(timezone.utc)

        on_tool = None
        if is_demo:
            publish_tool = _publisher(ctx, demo_mod.TOPIC_TOOL)
            on_tool = lambda tool, detail: publish_tool({"tool": tool, "detail": detail})  # noqa: E731
        agent = RecoveryAgent(event, attempt_number=attempt_number, merchant=merchant,
                              on_tool=on_tool)
        model = realtime.RealtimeModel(
            model=config.GEMINI_LIVE_MODEL, api_key=config.google_api_key(),
            voice=config.GEMINI_VOICE, language=config.GEMINI_LANGUAGE, temperature=0.6,
            input_audio_transcription=genai_types.AudioTranscriptionConfig(),
            output_audio_transcription=genai_types.AudioTranscriptionConfig(),
            # 3.8 defaults to NON_BLOCKING tools, where the model keeps talking
            # while a tool runs -- it then calls send_retry_link in the same
            # breath as asking "abhi bhej doon?", i.e. before consent.
            tool_behavior=genai_types.Behavior.BLOCKING,
            # Cut turn-taking latency: the default silence window before the
            # model decides the customer is done talking is noticeably laggy
            # on a live phone call. Shorter silence + higher-sensitivity
            # start/end-of-speech detection makes Priya respond right after
            # the customer stops, instead of a beat later.
            realtime_input_config=genai_types.RealtimeInputConfig(
                automatic_activity_detection=genai_types.AutomaticActivityDetection(
                    start_of_speech_sensitivity=genai_types.StartSensitivity.START_SENSITIVITY_HIGH,
                    end_of_speech_sensitivity=genai_types.EndSensitivity.END_SENSITIVITY_HIGH,
                    prefix_padding_ms=100,
                    silence_duration_ms=400,
                ),
            ),
        )
        session = AgentSession(llm=model)
        turn_timer = TurnTimer(session)

        # transcript: both sides. The agent's own turns come through
        # conversation_item_added; the customer's come through
        # user_input_transcribed. Both fire for the user's side of the
        # conversation, so conversation_item_added skips role="user" here --
        # recording both was writing every customer line twice.
        @session.on("conversation_item_added")
        def _on_item(ev) -> None:
            item = getattr(ev, "item", ev)
            role = getattr(item, "role", "unknown")
            if role == "user":
                return
            text = getattr(item, "text_content", None) or getattr(item, "content", "")
            if isinstance(text, list):
                text = " ".join(str(x) for x in text)
            agent.record_turn(role, str(text))

        @session.on("user_input_transcribed")
        def _on_user(ev) -> None:
            if getattr(ev, "is_final", True) and getattr(ev, "transcript", ""):
                agent.record_turn("user", ev.transcript)

        # real token usage for cost tracking (metrics/cost.py). Was previously
        # never captured -- every call logged 0 tokens and so cost ₹0 no
        # matter how long it ran. session_usage_updated fires with a running
        # cumulative total each time it changes; the last one we see before
        # the call ends is the final tally.
        usage_holder: list = []

        @session.on("session_usage_updated")
        def _on_usage(ev) -> None:
            usage_holder[:] = [ev.usage]

        # tracks whether the agent is actively speaking right now, so
        # _wait_for_end can wait for TTS to actually finish instead of a
        # fixed delay -- a closing sentence can take 6-12s to play, and a
        # blind short sleep was hanging up mid-sentence every time.
        speaking = {"now": False}

        @session.on("agent_state_changed")
        def _on_state(ev) -> None:
            speaking["now"] = getattr(ev, "new_state", None) == "speaking"

        # --- ring the customer in -----------------------------------------
        trunk_id = os.environ.get("SIP_OUTBOUND_TRUNK_ID")
        if should_dial and trunk_id:
            try:
                answered = await dial_sip_participant(
                    ctx, phone=event.customer.phone, trunk_id=trunk_id,
                    caller_id=os.environ.get("SIP_CALLER_ID") or None,
                )
            except Exception as exc:
                logger.warning("SIP dial failed: %s", exc)
                answered = False
                agent.outcome.error = f"sip_dial_failed: {type(exc).__name__}"
            if not answered:
                agent.outcome.result = "no_answer"
                await session.aclose()
                _finalise(event, agent, started_at, None)
                return

        if is_demo:
            # don't greet an empty room: the browser joins right after the
            # session is created, usually within a second or two
            try:
                await asyncio.wait_for(ctx.wait_for_participant(),
                                       timeout=config.DEMO_JOIN_TIMEOUT_S)
            except (asyncio.TimeoutError, RuntimeError):  # RuntimeError: room closed first
                logger.warning("demo visitor never joined")
                agent.outcome.result = "no_answer"
                agent.outcome.error = "demo_visitor_did_not_join"
                await session.aclose()
                await _close_room(ctx)
                _finalise(event, agent, started_at, None)
                return

        # the call is connected — default outcome for a call that just ends
        agent.outcome.result = "declined"

        egress_id = None if is_demo else await start_recording(ctx, event.event_id)

        await session.start(agent=agent, room=ctx.room)
        turn_timer.attach()
        # user_input, not instructions=: the Google plugin sends `instructions` as a
        # model-role turn, which gemini-3.8-live treats as already said and
        # answers with an empty turn (the greeting got dropped).
        await session.generate_reply(
            user_input="Call ki shuruaat karo: apna intro do aur identity confirm karo."
        )

        try:
            await asyncio.wait_for(
                _wait_for_end(session, agent, speaking),
                timeout=config.DEMO_MAX_CALL_DURATION_S if is_demo else config.MAX_CALL_DURATION_S,
            )
        except asyncio.TimeoutError:
            agent.outcome.error = "max_call_duration_exceeded"
            logger.warning("call hit max duration")
        finally:
            try:
                await session.aclose()
            except Exception:
                pass
            try:
                await stop_recording(egress_id)
            except Exception:
                pass
            if is_demo:
                # tell the website how it ended before the room goes away
                # (it falls back to GET /api/demo/session/{id} if this is missed)
                task = _publisher(ctx, demo_mod.TOPIC_OUTCOME)({
                    "result": agent.outcome.result, "error": agent.outcome.error,
                    "consent_captured": agent.outcome.consent_captured,
                    "refusal_captured": agent.outcome.refusal_captured,
                })
                if task:
                    try:
                        await asyncio.wait_for(task, timeout=3)
                    except Exception:  # noqa: BLE001
                        pass
            await _close_room(ctx)
            _apply_usage(agent, usage_holder)
            _finalise(event, agent, started_at, egress_id)
            logger.info("call log written: logs/calls/%s.log", event.event_id)


async def _close_room(ctx) -> None:
    # session.aclose() only tears down our own agent pipeline --
    # the SIP leg stays bridged until the room itself is closed,
    # so without this the phone call just sits there until the
    # customer hangs up manually or an empty-room timeout fires.
    # Deleting the room forces the actual hangup immediately.
    try:
        await asyncio.wait_for(
            ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name)),
            timeout=10,
        )
    except Exception as exc:
        logger.warning("could not close room %s: %s", ctx.room.name, exc)


def _apply_usage(agent: RecoveryAgent, usage_holder: list) -> None:
    if not usage_holder:
        return
    for u in usage_holder[0].model_usage:
        if getattr(u, "type", None) == "llm_usage":
            agent.outcome.prompt_tokens += u.input_tokens
            agent.outcome.completion_tokens += u.output_tokens


async def _wait_for_end(session, agent: RecoveryAgent, speaking: dict) -> None:
    """Resolve when the customer hangs up, or once the agent has actually
    invoked end_call AND finished speaking. Reaching a terminal outcome
    (e.g. send_retry_link setting result='recovered') is NOT enough on
    its own -- that fired mid-call, well before the closing remarks and
    end_call, and hanging up on it alone was cutting the agent off
    mid-sentence."""
    done = asyncio.Event()

    @session.on("close")
    def _c(_ev) -> None:
        done.set()

    while not done.is_set():
        if agent.call_ended_by_agent:
            # end_call fired -- wait for the agent to actually stop
            # speaking (closing line can take several seconds), with a
            # safety-net cap so a stuck "speaking" state can't hang the
            # call forever.
            for _ in range(40):  # up to ~20s
                if not speaking["now"]:
                    break
                await asyncio.sleep(0.5)
            # Gemini sometimes auto-narrates the end_call tool's own return
            # value right after ("a tool result wants no reply, but Gemini
            # will answer it anyway") -- interrupt immediately so that
            # spurious reply can't start playing before we tear down.
            try:
                await session.interrupt(force=True)
            except Exception:
                pass
            return
        await asyncio.sleep(0.5)


def _finalise(event: FailureEvent, agent: RecoveryAgent, started_at, egress_id) -> None:
    from datetime import datetime, timezone

    if agent.outcome.duration_s <= 0 and agent.outcome.result != "no_answer":
        agent.outcome.duration_s = (
            datetime.now(timezone.utc) - started_at
        ).total_seconds()
    if egress_id:
        agent.outcome.recording_url = recording_url(event.event_id)

    # best-effort — a DB blip at the end of a call must not crash the job
    for attempt in range(4):
        try:
            with db.get_conn() as conn:
                write_call_audit(lambda **kw: append_event(conn, **kw), event, agent.outcome)
            logger.info("call finalised: %s (%s, %.0fs)",
                        event.event_id, agent.outcome.result, agent.outcome.duration_s)
            return
        except Exception as exc:  # noqa: BLE001
            if attempt < 3:
                import time as _t
                _t.sleep(2 * (attempt + 1))
            else:
                logger.error("could not write call outcome for %s: %s",
                             event.event_id, exc)


def main() -> None:
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name=AGENT_NAME))


if __name__ == "__main__":
    main()
