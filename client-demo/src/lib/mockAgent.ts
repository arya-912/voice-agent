/**
 * In-browser simulator implementing the VoiceAgentProvider contract.
 * Replies are matched by keyword against the scripted flow — this is
 * not the production model, and the UI says so.
 */
import {
  AGENT_NAME,
  NOT_UNDERSTOOD,
  buildScript,
  scenarios,
  type Script,
  type ScriptReply,
} from "@/data/demoConversations";
import type { AgentSession, AgentTurn, TranscriptEntry } from "@/types";
import type {
  SimulatedFailure,
  VoiceAgentProvider,
} from "./api";
import { ApiError } from "./errors";

const SESSION_IDLE_MS = 10 * 60 * 1000;
const MAX_INPUT_CHARS = 200;

/**
 * When several replies match typed text, the more decisive intent wins:
 * a refusal must never be read as a "yes" because it contains "ji".
 */
const MATCH_PRIORITY = ["refuse", "wrong", "card", "ai", "busy", "promise", "soft_no", "no", "agree", "confirm", "ack"];

interface Session {
  script: Script;
  node: string;
  transcript: TranscriptEntry[];
  lastActive: number;
  ended: boolean;
}

const latency = () => 450 + Math.random() * 450;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let seq = 0;
const nextId = (p: string) => `${p}_${Date.now().toString(36)}_${(seq++).toString(36)}`;

function matchReply(replies: ScriptReply[], text: string): ScriptReply | undefined {
  const ranked = [...replies].sort(
    (a, b) => MATCH_PRIORITY.indexOf(a.id) - MATCH_PRIORITY.indexOf(b.id),
  );
  return ranked.find((r) => r.match.test(text));
}

export function createMockProvider(): VoiceAgentProvider & {
  setFailure(mode: SimulatedFailure): void;
} {
  const sessions = new Map<string, Session>();
  let failure: SimulatedFailure = "none";

  async function network() {
    await sleep(latency());
    if (failure === "unavailable") throw new ApiError("unavailable");
    if (failure === "timeout") await sleep(60_000); // outer withTimeout fires first
  }

  function live(sessionId: string): Session {
    const s = sessions.get(sessionId);
    if (!s) throw new ApiError("session_expired");
    if (failure === "expired" || Date.now() - s.lastActive > SESSION_IDLE_MS) {
      sessions.delete(sessionId);
      throw new ApiError("session_expired");
    }
    s.lastActive = Date.now();
    return s;
  }

  function turnFor(s: Session, nodeId: string): AgentTurn {
    const node = s.script[nodeId];
    s.node = nodeId;
    for (const e of node.events) {
      s.transcript.push(
        e.kind === "say"
          ? { id: nextId("t"), speaker: "agent", text: e.text, translation: e.translation, at: Date.now() }
          : { id: nextId("t"), speaker: "system", text: e.detail, tool: e.tool, at: Date.now() },
      );
    }
    const ended = !node.replies?.length;
    if (ended) s.ended = true;
    return {
      events: node.events,
      replies: (node.replies ?? []).map(({ id, label, text, translation }) => ({ id, label, text, translation })),
      ended,
      result: node.result,
    };
  }

  return {
    setFailure(mode) {
      failure = mode;
    },

    async startAgentSession(scenarioId): Promise<AgentSession> {
      await network();
      const scenario = scenarios.find((x) => x.id === scenarioId);
      if (!scenario) throw new ApiError("invalid_input", "Unknown demo scenario.");
      const sessionId = nextId("sess");
      const s: Session = {
        script: buildScript(scenario),
        node: "greet",
        transcript: [],
        lastActive: Date.now(),
        ended: false,
      };
      sessions.set(sessionId, s);
      return { sessionId, scenario, agentName: AGENT_NAME, firstTurn: turnFor(s, "greet") };
    },

    async sendMessage(sessionId, input): Promise<AgentTurn> {
      const s = live(sessionId);
      if (s.ended) throw new ApiError("session_expired");
      const replies = s.script[s.node].replies ?? [];

      let reply: ScriptReply | undefined;
      let spoken: string;
      if ("replyId" in input) {
        reply = replies.find((r) => r.id === input.replyId);
        if (!reply) throw new ApiError("invalid_input", "That reply isn't available at this point in the call.");
        spoken = reply.text;
      } else {
        spoken = input.text.trim();
        if (!spoken) throw new ApiError("invalid_input", "Type a reply before sending.");
        if (spoken.length > MAX_INPUT_CHARS)
          throw new ApiError("invalid_input", `Keep replies under ${MAX_INPUT_CHARS} characters.`);
        reply = matchReply(replies, spoken);
      }

      s.transcript.push({ id: nextId("t"), speaker: "customer", text: spoken, translation: reply && "replyId" in input ? reply.translation : undefined, at: Date.now() });
      await network();
      if (failure === "empty") throw new ApiError("empty");

      if (!reply) {
        // Didn't understand: ask again, stay on the same step.
        s.transcript.push({ id: nextId("t"), speaker: "agent", text: NOT_UNDERSTOOD.text, translation: NOT_UNDERSTOOD.translation, at: Date.now() });
        return {
          events: [NOT_UNDERSTOOD],
          replies: replies.map(({ id, label, text, translation }) => ({ id, label, text, translation })),
          ended: false,
        };
      }
      return turnFor(s, reply.next);
    },

    async endAgentSession(sessionId) {
      const s = sessions.get(sessionId);
      if (s) s.ended = true;
    },

    async getConversation(sessionId) {
      const s = sessions.get(sessionId);
      if (!s) throw new ApiError("session_expired");
      return [...s.transcript];
    },
  };
}
