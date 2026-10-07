/**
 * A live call to the real recovery agent, in the browser.
 *
 * The backend (metrics/demo_api.py) creates a LiveKit room, dispatches
 * the agent worker (voice/agent.py, Gemini Live) into it and returns a
 * token for this room only. We join, publish the microphone and play the
 * agent's audio. What the UI shows comes from the room:
 *
 * - `lk.transcription` text streams: both sides' live transcript
 * - `lk.agent.state` attribute: listening / thinking / speaking
 * - `razorcovery.tool` / `razorcovery.outcome` data: tool calls + result
 *
 * No secrets here; the token is short-lived and scoped to one room.
 */
import {
  createLocalAudioTrack,
  DisconnectReason,
  Room,
  RoomEvent,
  Track,
  type LocalAudioTrack,
  type RemoteParticipant,
} from "livekit-client";
import type { AgentTool, CallResult } from "@/types";
import { endLiveSession, startLiveSession } from "./api";
import { ApiError } from "./errors";

const TOPIC_TRANSCRIPTION = "lk.transcription";
const TOPIC_TOOL = "razorcovery.tool";
const TOPIC_OUTCOME = "razorcovery.outcome";
const ATTR_AGENT_STATE = "lk.agent.state";
const ATTR_SEGMENT_ID = "lk.segment_id";

/** LiveKit agent states (livekit-agents AgentState). */
export type LiveAgentState = "initializing" | "idle" | "listening" | "thinking" | "speaking";

export interface LiveCallHandlers {
  onAgentJoined(): void;
  onAgentState(state: LiveAgentState): void;
  /** One transcript segment, re-sent with the full text so far as it grows. */
  onTranscript(seg: { key: string; speaker: "agent" | "customer"; text: string }): void;
  onTool(tool: AgentTool, detail: string): void;
  onOutcome(result: CallResult | null): void;
  /** The room closed. `byServer` = the agent ended the call (room deleted). */
  onDisconnected(info: { byServer: boolean; byUser: boolean }): void;
}

export interface LiveCall {
  sessionId: string;
  hangUp(): Promise<void>;
}

/** Ask for the mic first, so a refusal doesn't use up a demo session. */
async function openMic(): Promise<LocalAudioTrack> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new ApiError("mic_denied", "This browser can't use the microphone here. Use a recent browser over HTTPS.");
  }
  try {
    return await createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true, autoGainControl: true });
  } catch (e) {
    const name = (e as Error)?.name;
    if (name === "NotFoundError") throw new ApiError("mic_denied", "No microphone was found on this device.");
    throw new ApiError("mic_denied");
  }
}

export async function startLiveCall(scenarioId: string, h: LiveCallHandlers): Promise<LiveCall> {
  const mic = await openMic();
  let session;
  try {
    session = await startLiveSession(scenarioId);
  } catch (e) {
    mic.stop();
    throw e;
  }

  const room = new Room();
  const audioEls = new Set<HTMLMediaElement>();
  let userHungUp = false;

  room.on(RoomEvent.TrackSubscribed, (track) => {
    if (track.kind !== Track.Kind.Audio) return;
    const el = track.attach();
    el.style.display = "none";
    document.body.appendChild(el);
    audioEls.add(el);
  });
  room.on(RoomEvent.TrackUnsubscribed, (track) => {
    track.detach().forEach((el) => {
      el.remove();
      audioEls.delete(el);
    });
  });
  const agentJoined = (p: RemoteParticipant) => {
    h.onAgentJoined();
    const state = p.attributes[ATTR_AGENT_STATE];
    if (state) h.onAgentState(state as LiveAgentState);
  };
  room.on(RoomEvent.ParticipantConnected, (p) => {
    if (p.isAgent) agentJoined(p);
  });
  room.on(RoomEvent.ParticipantAttributesChanged, (changed, p) => {
    if (p !== room.localParticipant && ATTR_AGENT_STATE in changed) {
      h.onAgentState(changed[ATTR_AGENT_STATE] as LiveAgentState);
    }
  });
  room.registerTextStreamHandler(TOPIC_TRANSCRIPTION, async (reader, from) => {
    const key = reader.info.attributes?.[ATTR_SEGMENT_ID] ?? reader.info.id;
    const speaker = from.identity === room.localParticipant.identity ? "customer" : "agent";
    // agent lines arrive as deltas on one stream; the visitor's as a new
    // stream per update carrying the full text. Either way: text so far.
    let text = "";
    try {
      for await (const chunk of reader) {
        text += chunk;
        if (text.trim()) h.onTranscript({ key, speaker, text: text.trim() });
      }
    } catch {
      /* stream cut by hang-up */
    }
  });
  room.on(RoomEvent.DataReceived, (payload, _p, _kind, topic) => {
    if (topic !== TOPIC_TOOL && topic !== TOPIC_OUTCOME) return;
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(new TextDecoder().decode(payload));
    } catch {
      return;
    }
    if (topic === TOPIC_TOOL) h.onTool(msg.tool as AgentTool, String(msg.detail ?? ""));
    else h.onOutcome((msg.result as CallResult) ?? null);
  });
  room.on(RoomEvent.Disconnected, (reason) => {
    mic.stop();
    audioEls.forEach((el) => el.remove());
    audioEls.clear();
    h.onDisconnected({
      byUser: userHungUp || reason === DisconnectReason.CLIENT_INITIATED,
      byServer: reason === DisconnectReason.ROOM_DELETED || reason === DisconnectReason.PARTICIPANT_REMOVED,
    });
  });

  try {
    await room.connect(session.livekit_url, session.token);
    await room.localParticipant.publishTrack(mic);
    // the click that started the call counts as the user gesture for audio
    await room.startAudio();
  } catch {
    mic.stop();
    void room.disconnect();
    void endLiveSession(session.session_id).catch(() => {});
    throw new ApiError("unavailable");
  }

  // the agent may have joined before our listeners saw it connect
  const present = Array.from(room.remoteParticipants.values()).find((p) => p.isAgent);
  if (present) agentJoined(present);

  return {
    sessionId: session.session_id,
    async hangUp() {
      userHungUp = true;
      await room.disconnect();
      await endLiveSession(session.session_id).catch(() => {});
    },
  };
}
