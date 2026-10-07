"""Browser demo sessions: the website talks to the real recovery agent.

A visitor on the client site picks one of the three recovery scenarios.
We build a fictional `FailureEvent` for it, create a LiveKit room,
dispatch the same worker (`voice/agent.py`) into it with `dial=false`
(so no phone is ever rung) and hand the browser a short-lived token that
can only join that one room. The LiveKit secret never leaves the server.

The visitor's browser is the "customer": it publishes the mic, hears
Gemini Live, and receives the live transcript + tool calls + outcome.

Demo calls are tagged `demo_` and kept out of the merchant dashboard
(metrics/app.py hides that prefix), but are still audited like any call.
"""
from __future__ import annotations

import json
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

from data.schemas import Customer, FailureEvent

# Mirrors the recovery entries in client-demo/src/data/demoScenarios.ts.
# All businesses and customers are fictional.
SCENARIOS: dict[str, dict] = {
    "payment_retry": {
        "customer_name": "Rohan Mehta", "merchant": "Kavya Home Store",
        "amount_inr": 2499, "error_code": "card_declined",
    },
    "checkout_abandonment": {
        "customer_name": "Ananya Iyer", "merchant": "Saanjh Living",
        "amount_inr": 4200, "error_code": "checkout_closed",
    },
    "mandate_failure": {
        "customer_name": "Vikram Singh", "merchant": "StreamBox Premium",
        "amount_inr": 1999, "error_code": "mandate_insufficient_funds",
    },
}

EVENT_PREFIX = "demo_"
SESSION_ID_RE = re.compile(r"^demo_[0-9a-f]{12}$")
TOKEN_TTL = timedelta(minutes=10)

# Data-channel topics the worker publishes on for demo calls; the website
# listens for them (client-demo/src/lib/liveAgent.ts).
TOPIC_TOOL = "razorcovery.tool"
TOPIC_OUTCOME = "razorcovery.outcome"


class DemoUnavailable(RuntimeError):
    """The demo can't run here (disabled or LiveKit not configured)."""


def enabled() -> bool:
    return os.environ.get("DEMO_ENABLED", "").strip().lower() in {"1", "true", "yes"}


def _livekit() -> tuple[str, str, str]:
    url = os.environ.get("LIVEKIT_URL", "").strip()
    key = os.environ.get("LIVEKIT_API_KEY", "").strip()
    secret = os.environ.get("LIVEKIT_API_SECRET", "").strip()
    if not (url and key and secret):
        raise DemoUnavailable("LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET not set")
    return url, key, secret


def room_name(session_id: str) -> str:
    return f"demo-{session_id}"


def build_event(scenario_id: str) -> FailureEvent:
    s = SCENARIOS[scenario_id]
    token = secrets.token_hex(6)
    return FailureEvent(
        event_id=f"{EVENT_PREFIX}{token}",
        created_at=datetime.now(timezone.utc),
        failure_type=scenario_id,
        # no real phone: the "customer" is the browser in the room
        customer=Customer(id=f"{EVENT_PREFIX}cust_{token}", name=s["customer_name"],
                          phone="browser", timezone="Asia/Kolkata"),
        amount_inr=s["amount_inr"],
        reference_id=f"{EVENT_PREFIX}ref_{token}",
        error_code=s["error_code"],
        prior_attempts=0,
        refused=False,
    )


def job_metadata(event: FailureEvent, merchant: str) -> str:
    d = json.loads(event.model_dump_json())
    d["_call"] = {"attempt_number": 1, "merchant": merchant, "dial": False, "demo": True}
    return json.dumps(d)


def visitor_token(session_id: str, *, key: str, secret: str) -> str:
    from livekit import api

    return (
        api.AccessToken(key, secret)
        .with_identity(f"visitor-{session_id}")
        .with_name("Website visitor")
        .with_ttl(TOKEN_TTL)
        .with_grants(api.VideoGrants(
            room_join=True, room=room_name(session_id),
            can_publish=True, can_subscribe=True, can_publish_data=False,
        ))
        .to_jwt()
    )


async def start_session(scenario_id: str) -> dict:
    """Create the room, dispatch the agent, return what the browser needs."""
    if scenario_id not in SCENARIOS:
        raise ValueError(f"unknown scenario {scenario_id!r}")
    url, key, secret = _livekit()
    from livekit import api

    event = build_event(scenario_id)
    room = room_name(event.event_id)
    agent_name = os.environ.get("LIVEKIT_AGENT_NAME", "razorcovery-agent")
    lk = api.LiveKitAPI(url=url, api_key=key, api_secret=secret)
    try:
        # a visitor who closes the tab leaves an empty room; reap it fast
        await lk.room.create_room(api.CreateRoomRequest(
            name=room, empty_timeout=30, departure_timeout=10, max_participants=3,
        ))
        await lk.agent_dispatch.create_dispatch(api.CreateAgentDispatchRequest(
            room=room, agent_name=agent_name,
            metadata=job_metadata(event, SCENARIOS[scenario_id]["merchant"]),
        ))
    finally:
        await lk.aclose()

    return {
        "session_id": event.event_id,
        "scenario_id": scenario_id,
        "livekit_url": url,
        "token": visitor_token(event.event_id, key=key, secret=secret),
        "expires_at": (datetime.now(timezone.utc) + TOKEN_TTL).isoformat(),
    }


async def end_session(session_id: str) -> None:
    """Close the room (hangs up the agent). Missing room is fine."""
    url, key, secret = _livekit()
    from livekit import api

    lk = api.LiveKitAPI(url=url, api_key=key, api_secret=secret)
    try:
        await lk.room.delete_room(api.DeleteRoomRequest(room=room_name(session_id)))
    except Exception:  # noqa: BLE001 — already gone
        pass
    finally:
        await lk.aclose()


def outcome(session_id: str) -> dict | None:
    """The call's outcome row from audit_log, once the worker has written it."""
    from audit import db
    from audit.log import query

    with db.get_conn() as conn:
        rows = query(conn, event_id=session_id, entry_type="outcome")
    if not rows:
        return None
    p = rows[-1].get("payload") or {}
    return {
        "result": p.get("result"),
        "duration_s": p.get("duration_s"),
        "consent_captured": p.get("consent_captured"),
        "refusal_captured": p.get("refusal_captured"),
        "transcript": p.get("transcript") or [],
        "error": p.get("error"),
    }
