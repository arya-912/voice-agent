/**
 * Shared types. Names mirror the Python backend where a concept exists
 * there (failure types, interventions, call results, the voice-flow tools)
 * so swapping mock data for real API data is a mapping, not a rewrite.
 */

/** decision/rules.py — the three failure types the agent handles today. */
export type FailureType = "payment_retry" | "checkout_abandonment" | "mandate_failure";

/** decision/rules.py — what the decision layer can route an event to. */
export type Intervention = "voice" | "sms" | "link_only" | "none";

/** voice/outcome.py — how a call can end. */
export type CallResult =
  | "recovered"
  | "link_sent_no_commit"
  | "declined"
  | "refused"
  | "wrong_number"
  | "no_answer"
  | "failed";

/** voice/flow.py — the only actions the model can take. */
export type AgentTool =
  | "send_retry_link"
  | "offer_declined"
  | "mark_do_not_contact"
  | "wrong_person"
  | "end_call";

/**
 * Availability is shown on every capability/agent card so the site never
 * implies production support for something that isn't built.
 */
export type Availability = "live" | "preview" | "roadmap";

export type IconName =
  | "phone"
  | "phoneOff"
  | "mic"
  | "wave"
  | "languages"
  | "shield"
  | "shieldCheck"
  | "route"
  | "upload"
  | "list"
  | "chart"
  | "pen"
  | "link"
  | "clock"
  | "ban"
  | "file"
  | "database"
  | "server"
  | "code"
  | "bot"
  | "user"
  | "check"
  | "x"
  | "arrowRight"
  | "menu"
  | "cart"
  | "repeat"
  | "creditCard"
  | "headset"
  | "calendar"
  | "bell"
  | "sparkles"
  | "lock"
  | "alert"
  | "volume"
  | "volumeOff"
  | "send"
  | "restart"
  | "building";

export interface Capability {
  title: string;
  description: string;
  icon: IconName;
  availability: Availability;
  /** Where it lives in the codebase — shown as a small proof point. */
  source?: string;
}

export interface SampleLine {
  speaker: "agent" | "customer";
  text: string;
  /** English gloss for Hinglish lines. */
  translation?: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  purpose: string;
  icon: IconName;
  availability: Availability;
  failureType?: FailureType;
  routing: string;
  capabilities: string[];
  sample: SampleLine[];
  /** Scenario id on /demo, when one exists. */
  demoScenario?: string;
}

export interface UseCase {
  title: string;
  description: string;
  icon: IconName;
  availability: Availability;
  examples: string[];
}

export interface Integration {
  name: string;
  category: "Voice & AI" | "Telephony" | "Data in" | "Data out" | "Payments";
  description: string;
  availability: Availability;
}

export interface Step {
  title: string;
  description: string;
  icon: IconName;
  detail: string;
}

export interface Guardrail {
  title: string;
  description: string;
  icon: IconName;
}

/* ------------------------------------------------------------------ */
/* Interactive demo                                                    */
/* ------------------------------------------------------------------ */

export type CallStatus =
  | "ready"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "ended"
  | "error";

export interface TranscriptEntry {
  id: string;
  speaker: "agent" | "customer" | "system";
  text: string;
  translation?: string;
  /** Present when speaker === "system" and the entry is a tool call. */
  tool?: AgentTool;
  at: number;
}

export interface ReplyOption {
  id: string;
  label: string;
  text: string;
  translation?: string;
}

export type TurnEvent =
  | { kind: "say"; text: string; translation?: string }
  | { kind: "tool"; tool: AgentTool; detail: string };

export interface AgentTurn {
  /** Ordered: what the agent says and which tools it calls, in sequence. */
  events: TurnEvent[];
  replies: ReplyOption[];
  ended: boolean;
  result?: CallResult;
}

export interface DemoScenario {
  id: string;
  title: string;
  failureType: FailureType;
  customerName: string;
  merchant: string;
  amountInr: number;
  context: string;
  routingReason: string;
}

export interface AgentSession {
  sessionId: string;
  scenario: DemoScenario;
  agentName: string;
  firstTurn: AgentTurn;
}

/* ------------------------------------------------------------------ */
/* Analytics — mirrors GET /api/summary and GET /api/calls             */
/* ------------------------------------------------------------------ */

export interface SummaryBucket {
  key: string;
  events: number;
  contacted: number;
  recovered: number;
  amount_at_risk_inr: number;
  amount_recovered_inr: number;
  recovery_rate: number;
}

export interface AnalyticsSummary {
  total_events: number;
  contacted: number;
  recovered: number;
  amount_at_risk_inr: number;
  amount_recovered_inr: number;
  recovery_rate: number;
  by_failure_type: SummaryBucket[];
  stopping_rule_counts: Record<string, number>;
  effort: {
    total_call_minutes: number;
    total_attempts: number;
    cost_per_recovery_inr: number;
  };
}

export interface CallLogRow {
  event_id: string;
  customer_name: string;
  ts: string;
  amount_inr: number;
  failure_type: FailureType;
  duration_s: number;
  result: CallResult;
}
