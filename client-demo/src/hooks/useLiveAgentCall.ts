"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, describeError, endLiveSessionOnUnload, getLiveSession } from "@/lib/api";
import type { LiveAgentState, LiveCall } from "@/lib/liveAgent";
import type { CallResult, CallStatus, ReplyOption, TranscriptEntry } from "@/types";
import type { CallError } from "./useAgentCall";

/** The agent worker has this long to join the room before we give up. */
const AGENT_JOIN_TIMEOUT_MS = 20_000;
/** After the call, the worker writes its outcome; poll for it this long. */
const OUTCOME_POLL_MS = 8_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const NO_REPLIES: ReplyOption[] = [];
const NOTHING_COLLECTED: Record<string, string> = {};
let entrySeq = 0;
const entryId = () => `l${++entrySeq}`;

const stateToStatus: Record<LiveAgentState, CallStatus> = {
  initializing: "connecting",
  idle: "listening",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
};

/**
 * Drives one live call to the real agent (lib/liveAgent.ts). Returns the
 * same shape as useAgentCall so the demo UI renders either; there are no
 * reply buttons here, the visitor just talks.
 */
export function useLiveAgentCall() {
  const [status, setStatus] = useState<CallStatus>("ready");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [result, setResult] = useState<CallResult | null>(null);
  const [error, setError] = useState<CallError | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const callRef = useRef<LiveCall | null>(null);
  const resultRef = useRef<CallResult | null>(null);
  const startedAt = useRef<number | null>(null);
  const segIds = useRef(new Map<string, string>());
  /** Bumped on every new call/hang-up/reset so stale callbacks stop. */
  const epoch = useRef(0);

  useEffect(() => {
    if (status === "ready" || status === "ended" || status === "error") return;
    const t = setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [status]);

  const push = useCallback((e: Omit<TranscriptEntry, "id" | "at">) => {
    setTranscript((t) => [...t, { ...e, id: entryId(), at: Date.now() }]);
  }, []);

  const fail = useCallback((err: unknown) => {
    setError(describeError(err));
    setStatus("error");
    startedAt.current = null;
  }, []);

  /** Close out the call: use the live outcome, else ask the backend. */
  const finish = useCallback(async (sessionId: string, myEpoch: number) => {
    startedAt.current = null;
    if (!resultRef.current) {
      setStatus("thinking");
      const until = Date.now() + OUTCOME_POLL_MS;
      while (Date.now() < until && epoch.current === myEpoch) {
        try {
          const s = await getLiveSession(sessionId);
          if (s.status === "ended" && s.outcome?.result) {
            resultRef.current = s.outcome.result;
            break;
          }
        } catch {
          break;
        }
        await sleep(1000);
      }
    }
    if (epoch.current !== myEpoch) return;
    setResult(resultRef.current);
    setStatus("ended");
  }, []);

  const start = useCallback(
    async (scenarioId: string) => {
      const myEpoch = ++epoch.current;
      void callRef.current?.hangUp();
      callRef.current = null;
      resultRef.current = null;
      segIds.current.clear();
      setTranscript([]);
      setResult(null);
      setError(null);
      setElapsed(0);
      setStatus("connecting");

      let agentJoined = false;
      const stale = () => epoch.current !== myEpoch;

      try {
        // loaded on demand: the WebRTC SDK is only needed for a live call
        const { startLiveCall } = await import("@/lib/liveAgent");
        const call = await startLiveCall(scenarioId, {
          onAgentJoined() {
            if (stale() || agentJoined) return;
            agentJoined = true;
            startedAt.current = Date.now();
            push({ speaker: "system", text: "Connected to the live agent · speak when it greets you" });
          },
          onAgentState(state) {
            if (stale()) return;
            const next = stateToStatus[state];
            if (next) setStatus((s) => (s === "ended" || s === "error" ? s : next));
          },
          onTranscript({ key, speaker, text }) {
            if (stale()) return;
            const id = segIds.current.get(key);
            if (id) {
              setTranscript((t) => t.map((e) => (e.id === id ? { ...e, text } : e)));
            } else {
              const nid = entryId();
              segIds.current.set(key, nid);
              setTranscript((t) => [...t, { id: nid, speaker, text, at: Date.now() }]);
            }
          },
          onTool(tool, detail) {
            if (!stale()) push({ speaker: "system", text: detail, tool });
          },
          onOutcome(r) {
            if (!stale()) resultRef.current = r;
          },
          onDisconnected({ byServer, byUser }) {
            if (stale()) return;
            if (byUser) return; // hangUp() already handled it
            if (byServer || resultRef.current) {
              push({ speaker: "system", text: "The agent ended the call" });
              void finish(call.sessionId, myEpoch);
            } else {
              fail(new ApiError("disconnected"));
            }
          },
        });
        if (stale()) {
          void call.hangUp();
          return;
        }
        callRef.current = call;

        await sleep(AGENT_JOIN_TIMEOUT_MS);
        if (!stale() && !agentJoined) {
          void call.hangUp();
          callRef.current = null;
          fail(new ApiError("timeout"));
        }
      } catch (err) {
        if (!stale()) fail(err);
      }
    },
    [fail, finish, push],
  );

  const hangUp = useCallback(() => {
    const call = callRef.current;
    const myEpoch = ++epoch.current;
    callRef.current = null;
    push({ speaker: "system", text: "You ended the call" });
    startedAt.current = null;
    if (!call) {
      setStatus("ended");
      return;
    }
    void call.hangUp().then(() => finish(call.sessionId, myEpoch));
  }, [finish, push]);

  const reset = useCallback(() => {
    epoch.current++;
    void callRef.current?.hangUp();
    callRef.current = null;
    resultRef.current = null;
    startedAt.current = null;
    setTranscript([]);
    setResult(null);
    setError(null);
    setElapsed(0);
    setStatus("ready");
  }, []);

  // Leaving or refreshing the page mid-call hangs up the agent.
  useEffect(() => {
    const ep = epoch;
    const onUnload = () => {
      if (callRef.current) endLiveSessionOnUnload(callRef.current.sessionId);
    };
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.removeEventListener("pagehide", onUnload);
      ep.current++;
      void callRef.current?.hangUp();
    };
  }, []);

  const getSessionId = useCallback(() => callRef.current?.sessionId ?? null, []);
  const respond = useCallback(async () => {}, []);

  return {
    status, transcript, replies: NO_REPLIES, result, error, elapsed, collected: NOTHING_COLLECTED,
    start, respond, hangUp, reset, getSessionId,
  };
}
