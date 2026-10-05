/**
 * In-browser simulator implementing the VoiceAgentProvider contract.
 * Replies are matched by keyword against scripted flows (data/demoScenarios.ts).
 * It is not the production model and doesn't call any backend; the UI says so.
 */
import { buildScript, scenarios } from "@/data/demoScenarios";
import { PRIORITY, type Answers, type Script, type ScriptReply } from "@/data/demoScript";
import type { AgentSession, AgentTurn, ReplyOption, TranscriptEntry } from "@/types";
import type {
  SimulatedFailure,
  VoiceAgentProvider,
} from "./api";
import { ApiError } from "./errors";

const SESSION_IDLE_MS = 10 * 60 * 1000;
const MAX_INPUT_CHARS = 200;
const MAX_CAPTURE_CHARS = 60;

interface Session {
  script: Script;
  node: string;
  answers: Answers;
  transcript: TranscriptEntry[];
  lastActive: number;
  ended: boolean;
}

const latency = () => 450 + Math.random() * 450;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let seq = 0;
const nextId = (p: string) => `${p}_${Date.now().toString(36)}_${(seq++).toString(36)}`;

/** When several replies match typed text, the more decisive intent wins. */
function matchReply(replies: ScriptReply[], text: string): ScriptReply | undefined {
  const ranked = replies
    .filter((r) => r.match)
    .sort((a, b) => (a.priority ?? PRIORITY.option) - (b.priority ?? PRIORITY.option));
  return ranked.find((r) => r.match!.test(text));
}

const visible = (replies: ScriptReply[] = []): ReplyOption[] =>
  replies.filter((r) => !r.hidden).map(({ id, label, text, translation }) => ({ id, label, text, translation }));

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
    const node = s.script.nodes[nodeId];
    s.node = nodeId;
    const events = typeof node.events === "function" ? node.events(s.answers) : node.events;
    for (const e of events) {
      s.transcript.push(
        e.kind === "say"
          ? { id: nextId("t"), speaker: "agent", text: e.text, translation: e.translation, at: Date.now() }
          : { id: nextId("t"), speaker: "system", text: e.detail, tool: e.tool, at: Date.now() },
      );
    }
    const ended = !node.replies?.length;
    if (ended) s.ended = true;
    return { events, replies: visible(node.replies), ended, result: node.result, collected: { ...s.answers } };
  }

  return {
    setFailure(mode) {
      failure = mode;
    },

    async startAgentSession(scenarioId): Promise<AgentSession> {
      await network();
      const scenario = scenarios.find((x) => x.id === scenarioId);
      const script = buildScript(scenarioId);
      if (!scenario || !script) throw new ApiError("invalid_input", "Unknown demo scenario.");
      const sessionId = nextId("sess");
      const s: Session = { script, node: script.start, answers: {}, transcript: [], lastActive: Date.now(), ended: false };
      sessions.set(sessionId, s);
      return { sessionId, scenario, agentName: scenario.agentName, firstTurn: turnFor(s, script.start) };
    },

    async sendMessage(sessionId, input): Promise<AgentTurn> {
      const s = live(sessionId);
      if (s.ended) throw new ApiError("session_expired");
      const replies = s.script.nodes[s.node].replies ?? [];

      let reply: ScriptReply | undefined;
      let spoken: string;
      if ("replyId" in input) {
        reply = replies.find((r) => r.id === input.replyId && !r.hidden);
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
        const nu = s.script.notUnderstood;
        s.transcript.push({ id: nextId("t"), speaker: "agent", text: nu.text, translation: nu.translation, at: Date.now() });
        return { events: [{ kind: "say", ...nu }], replies: visible(replies), ended: false, collected: { ...s.answers } };
      }
      if (reply.capture) {
        s.answers[reply.capture.field] = reply.capture.value ?? spoken.replace(/[.!]+$/, "").slice(0, MAX_CAPTURE_CHARS);
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
