import type { AgentTool, CallResult, ReplyOption, TurnEvent } from "@/types";

/**
 * Building blocks for the /demo simulator's scripted calls.
 *
 * A Script is a small graph of nodes. Each node is what the agent says and
 * which tools it calls, plus the replies the "customer" (the visitor) can
 * give. Typed replies are matched by keyword, in priority order. This is a
 * simulation, not the production model, and the UI says so.
 */

/** Details the agent has captured during the call (field label → value). */
export type Answers = Record<string, string>;

export interface ScriptReply extends ReplyOption {
  next: string;
  /** How to recognise this reply when typed or spoken. Omit for button-only replies. */
  match?: RegExp;
  /** Lower is checked first, so a refusal is never read as a "yes". */
  priority?: number;
  /** Matched by typed text but not offered as a suggestion button. */
  hidden?: boolean;
  /** Save this reply as a captured detail. `value` defaults to what the customer said. */
  capture?: { field: string; value?: string };
}

export interface ScriptNode {
  events: TurnEvent[] | ((answers: Answers) => TurnEvent[]);
  replies?: ScriptReply[];
  /** Set on terminal nodes. */
  result?: CallResult;
}

export interface Script {
  start: string;
  nodes: Record<string, ScriptNode>;
  /** What the agent says when it can't match a reply. */
  notUnderstood: { text: string; translation?: string };
}

/** Match priorities shared by every script. */
export const PRIORITY = {
  refuse: 0,
  wrong: 1,
  card: 2,
  human: 3,
  ai: 4,
  busy: 5,
  promise: 6,
  softNo: 7,
  option: 10,
  agree: 20,
  ack: 30,
  freeText: 90,
} as const;

export const YES = /\b(ha+n?|haa|yes|yeah|yep|ok(ay)?|sure|theek|thik|bhej|send|chalo|ji|go ahead|speaking|correct|that'?s me)\b/i;
export const NO_SOFT = /\b(nahi|nahin|no|not now|baad mein|later|abhi nahi|interest nahi|mat bhejo|not interested|no thanks)\b/i;
export const HARD_STOP = /(dobara|kabhi|never|mat karna|don'?t call|do not call|stop calling|band karo|remove my number)/i;
export const PROMISE = /\b(kal|tomorrow|parso|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|tak kar|salary)\b/i;
export const WRONG = /(wrong|galat|nahi hoon|not me|koi aur|someone else|no one by)/i;
export const BUSY = /(busy|meeting|driving|drive kar|baad mein call|call back|call me later|abhi baat nahi|not a good time)/i;
export const AI_Q = /\b(bot|ai|robot|machine|computer|insaan|real person|recording)\b/i;
export const HUMAN = /(human|real person|a person|manager|executive|advisor|counsellor|counselor|talk to (a|some)|speak to (a|some)|transfer)/i;
/** Stronger than NO_SOFT, so a plain "no" can still answer a question. */
export const NOT_INTERESTED = /(not interested|no thanks|interest nahi|don'?t want|not looking|no longer)/i;
export const CARD = /\b(card|cvv|otp|pin|upi)\b/i;
export const ACK = /\b(ok(ay)?|theek|thik|thanks?|thank you|shukriya|dhanyavaad|achha|accha|haan|ji|got it|bye)\b/i;
export const ANY = /\S/;

const say = (text: string, translation?: string): TurnEvent => ({ kind: "say", text, translation });
const tool = (t: AgentTool, detail: string): TurnEvent => ({ kind: "tool", tool: t, detail });
const hangUp = tool("end_call", "Closing line finished, hanging up");

export function summarise(a: Answers) {
  const parts = Object.entries(a).map(([k, v]) => `${k}: ${v}`);
  return parts.length ? parts.join(" · ") : "no details captured";
}

/* ------------------------------------------------------------------ */
/* Generic lead call: confirm → ask questions → offer next step        */
/* ------------------------------------------------------------------ */

export interface LeadQuestion {
  /** Label the answer is saved under, e.g. "Budget". */
  field: string;
  ask: string;
  options: { label: string; value?: string; escalate?: boolean }[];
  /** Typed answers matching this go straight to a person (e.g. a complaint). */
  escalateIf?: RegExp;
}

export interface LeadChoice {
  id: string;
  label: string;
  text: string;
  match?: RegExp;
  tool: AgentTool;
  detail: (a: Answers) => string;
  say: (a: Answers) => string;
  result: CallResult;
}

export interface LeadCallSpec {
  agentName: string;
  business: string;
  customerName: string;
  /** Why the agent is calling. Said once the customer confirms who they are. */
  intro: string;
  questions: LeadQuestion[];
  /** Proposes the next step, after the questions. */
  offer: (a: Answers) => string;
  /** Two or three next steps the customer can pick. The first one also matches a plain "yes". */
  choices: LeadChoice[];
  /** What the team is told when the call is handed over. */
  handoffDetail?: (a: Answers) => string;
}

const ACKS = ["Got it, thank you.", "Perfect.", "Thanks, noted.", "Great."];

export function buildLeadCallScript(spec: LeadCallSpec): Script {
  const first = spec.customerName.replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/, "").split(" ")[0];
  const qid = (i: number) => (i < spec.questions.length ? `q${i}` : "offer");

  const exits = (aiNode?: string): ScriptReply[] => [
    { id: "human", label: "Can I talk to a person?", text: "Can I talk to a person instead?", next: "handoff", match: HUMAN, priority: PRIORITY.human },
    { id: "soft_no", label: "Not interested", text: "Sorry, I'm not interested anymore.", next: "declined", match: NOT_INTERESTED, priority: PRIORITY.softNo },
    { id: "refuse", label: "Don't call me again", text: "Please don't call me again.", next: "dnc", match: HARD_STOP, priority: PRIORITY.refuse, hidden: true },
    { id: "busy", label: "I'm busy right now", text: "I'm busy right now, call me later.", next: "callback", match: BUSY, priority: PRIORITY.busy, hidden: true },
    ...(aiNode
      ? [{ id: "ai", label: "Are you a bot?", text: "Wait, am I talking to a bot?", next: aiNode, match: AI_Q, priority: PRIORITY.ai, hidden: true }]
      : []),
  ];

  const questionReplies = (i: number, withAi: boolean): ScriptReply[] => {
    const q = spec.questions[i];
    return [
      ...q.options.map((o, j) => ({
        id: `q${i}_o${j}`,
        label: o.label,
        text: o.label.endsWith(".") ? o.label : `${o.label}.`,
        next: o.escalate ? "handoff" : qid(i + 1),
        priority: PRIORITY.option,
        capture: { field: q.field, value: o.value ?? o.label },
      })),
      ...exits(withAi ? `q${i}_ai` : undefined),
      ...(q.escalateIf
        ? [{ id: `q${i}_escalate`, label: "", text: "", next: "handoff", match: q.escalateIf, priority: PRIORITY.option, hidden: true, capture: { field: q.field } }]
        : []),
      // Anything else typed is taken as the answer to the question.
      { id: `q${i}_free`, label: "", text: "", next: qid(i + 1), match: ANY, priority: PRIORITY.freeText, hidden: true, capture: { field: q.field } },
    ];
  };

  const nodes: Script["nodes"] = {
    greet: {
      events: [say(`Hi, this is ${spec.agentName}, an AI assistant calling from ${spec.business}. Am I speaking with ${spec.customerName}?`)],
      replies: [
        { id: "confirm", label: "Yes, speaking", text: "Yes, speaking.", next: "q0", match: YES, priority: PRIORITY.agree },
        { id: "busy", label: "I'm busy right now", text: "I'm busy right now, can you call later?", next: "callback", match: BUSY, priority: PRIORITY.busy },
        { id: "wrong", label: "Wrong number", text: `No, there's no ${first} here.`, next: "wrong", match: WRONG, priority: PRIORITY.wrong },
        { id: "refuse", label: "Don't call me again", text: "Please don't call me again.", next: "dnc", match: HARD_STOP, priority: PRIORITY.refuse },
      ],
    },
    offer: {
      events: (a) => [
        tool("record_details", `Lead record updated · ${summarise(a)}`),
        say(spec.offer(a)),
      ],
      replies: [
        ...spec.choices.map((c, i) => ({
          id: c.id,
          label: c.label,
          text: c.text,
          next: `choice_${c.id}`,
          match: c.match ?? (i === 0 ? YES : undefined),
          priority: c.match ? PRIORITY.option : PRIORITY.agree,
        })),
        ...exits().map((r) => (r.id === "soft_no" ? { ...r, label: "Not right now", text: "Not right now, thanks.", match: NO_SOFT } : r)),
      ],
    },
    handoff: {
      events: (a) => [
        tool("handoff_to_human", spec.handoffDetail?.(a) ?? `Callback task created for the team · ${summarise(a)}`),
        say(`Of course. I've passed everything you told me to the team at ${spec.business}, and a person will call you back during working hours. Thank you, ${first}!`),
        hangUp,
      ],
      result: "handed_off",
    },
    callback: {
      events: [
        tool("schedule_callback", "Callback scheduled · later today, within calling hours"),
        say(`No problem at all. I'll call you back later today. Thank you, and have a good day!`),
        hangUp,
      ],
      result: "callback_scheduled",
    },
    declined: {
      events: [
        tool("offer_declined", "Not interested · lead closed, no further follow-up planned"),
        say("I understand, thank you for letting me know. If you need anything later, just reach out. Have a good day!"),
        hangUp,
      ],
      result: "declined",
    },
    dnc: {
      events: [
        tool("mark_do_not_contact", "Opt-out recorded · number won't be called again"),
        say("Of course, I'm sorry for the disturbance. You won't be contacted again."),
        hangUp,
      ],
      result: "refused",
    },
    wrong: {
      events: [
        tool("wrong_person", "Wrong number · flagged on the lead"),
        say("Oh, I'm sorry for the trouble. Have a good day."),
        hangUp,
      ],
      result: "wrong_number",
    },
  };

  spec.questions.forEach((q, i) => {
    const lead = i === 0 ? [say(spec.intro), say(q.ask)] : [say(`${ACKS[(i - 1) % ACKS.length]} ${q.ask}`)];
    nodes[`q${i}`] = { events: lead, replies: questionReplies(i, true) };
    nodes[`q${i}_ai`] = {
      events: [say(`Yes, I'm an AI assistant for ${spec.business}. I can note a few details so the team can help you faster, or have a person call you. ${q.ask}`)],
      replies: questionReplies(i, false),
    };
  });

  spec.choices.forEach((c) => {
    nodes[`choice_${c.id}`] = {
      events: (a) => [tool(c.tool, c.detail(a)), say(c.say(a)), hangUp],
      result: c.result,
    };
  });

  return {
    start: "greet",
    nodes,
    notUnderstood: { text: "Sorry, I didn't quite catch that. Could you say it again?" },
  };
}
