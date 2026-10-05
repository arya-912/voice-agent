"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  describeError,
  endAgentSession,
  sendMessage,
  startAgentSession,
  type CustomerInput,
} from "@/lib/api";
import type {
  AgentTurn,
  CallResult,
  CallStatus,
  DemoScenario,
  ReplyOption,
  TranscriptEntry,
} from "@/types";
import { useSpeech } from "./useSpeech";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Roughly natural speaking pace for revealing agent lines. */
const speakMs = (text: string) => Math.min(4200, 900 + text.length * 32);

let entrySeq = 0;
const entryId = () => `e${++entrySeq}`;

export interface CallError {
  title: string;
  body: string;
  retryable: boolean;
}

/**
 * Drives one demo call: status machine, transcript, timer, and playback
 * of each agent turn (lines spoken in order, tool calls shown inline).
 * Talks only to lib/api — swapping the backend doesn't touch this hook.
 */
export function useAgentCall({ voice }: { voice: boolean }) {
  const [status, setStatus] = useState<CallStatus>("ready");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [replies, setReplies] = useState<ReplyOption[]>([]);
  const [result, setResult] = useState<CallResult | null>(null);
  const [error, setError] = useState<CallError | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [scenario, setScenario] = useState<DemoScenario | null>(null);
  const [collected, setCollected] = useState<Record<string, string>>({});

  const sessionRef = useRef<string | null>(null);
  const langRef = useRef<"English" | "Hinglish">("English");
  const startedAt = useRef<number | null>(null);
  /** Bumped on every new call/hang-up so stale async work stops. */
  const epoch = useRef(0);
  const speech = useSpeech(voice);

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
    setReplies([]);
  }, []);

  const playTurn = useCallback(
    async (turn: AgentTurn, myEpoch: number) => {
      if (!turn.events.length) throw new ApiError("empty");
      if (turn.collected) setCollected(turn.collected);
      for (const ev of turn.events) {
        if (epoch.current !== myEpoch) return;
        if (ev.kind === "say") {
          setStatus("speaking");
          push({ speaker: "agent", text: ev.text, translation: ev.translation });
          await Promise.all([sleep(speakMs(ev.text)), speech.speak(ev.text, langRef.current)]);
        } else {
          setStatus("thinking");
          await sleep(500);
          if (epoch.current !== myEpoch) return;
          push({ speaker: "system", text: ev.detail, tool: ev.tool });
          await sleep(450);
        }
      }
      if (epoch.current !== myEpoch) return;
      if (turn.ended) {
        setResult(turn.result ?? null);
        setStatus("ended");
        setReplies([]);
        startedAt.current = null;
        if (sessionRef.current) void endAgentSession(sessionRef.current).catch(() => {});
      } else {
        setReplies(turn.replies);
        setStatus("listening");
      }
    },
    [push, speech],
  );

  const start = useCallback(
    async (scenarioId: string) => {
      const myEpoch = ++epoch.current;
      speech.cancel();
      setTranscript([]);
      setReplies([]);
      setResult(null);
      setError(null);
      setCollected({});
      setElapsed(0);
      setStatus("connecting");
      try {
        const session = await startAgentSession(scenarioId);
        if (epoch.current !== myEpoch) return;
        sessionRef.current = session.sessionId;
        langRef.current = session.scenario.language;
        setScenario(session.scenario);
        startedAt.current = Date.now();
        push({ speaker: "system", text: `Call connected to ${session.scenario.customerName}` });
        await playTurn(session.firstTurn, myEpoch);
      } catch (err) {
        if (epoch.current === myEpoch) fail(err);
      }
    },
    [fail, playTurn, push, speech],
  );

  const respond = useCallback(
    async (input: CustomerInput, displayText: string, translation?: string) => {
      const id = sessionRef.current;
      if (!id || status !== "listening") return;
      const myEpoch = epoch.current;
      setReplies([]);
      push({ speaker: "customer", text: displayText, translation });
      setStatus("thinking");
      try {
        const turn = await sendMessage(id, input);
        if (epoch.current !== myEpoch) return;
        await playTurn(turn, myEpoch);
      } catch (err) {
        if (epoch.current === myEpoch) fail(err);
      }
    },
    [fail, playTurn, push, status],
  );

  const hangUp = useCallback(() => {
    epoch.current++;
    speech.cancel();
    if (sessionRef.current) void endAgentSession(sessionRef.current).catch(() => {});
    push({ speaker: "system", text: "You ended the call" });
    setReplies([]);
    setStatus("ended");
    startedAt.current = null;
  }, [push, speech]);

  const reset = useCallback(() => {
    epoch.current++;
    speech.cancel();
    sessionRef.current = null;
    startedAt.current = null;
    setTranscript([]);
    setReplies([]);
    setResult(null);
    setError(null);
    setCollected({});
    setElapsed(0);
    setStatus("ready");
  }, [speech]);

  useEffect(() => () => {
    epoch.current++;
    speech.cancel();
  }, [speech]);

  const getSessionId = useCallback(() => sessionRef.current, []);

  return { status, transcript, replies, result, error, elapsed, scenario, collected, start, respond, hangUp, reset, getSessionId };
}
