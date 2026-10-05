/**
 * Shared types. Names mirror the Python backend where a concept exists
 * there (failure types, interventions, call results, the voice-flow tools)
 * so swapping mock data for real API data is a mapping, not a rewrite.
 */

/** decision/rules.py — the three failure types the agent handles today. */
export type FailureType = "payment_retry" | "checkout_abandonment" | "mandate_failure";

/** decision/rules.py — what the decision layer can route an event to. */
export type Intervention = "voice" | "sms" | "link_only" | "none";

/**
 * How a call can end. The first seven mirror voice/outcome.py (the
 * payment-recovery implementation); the rest are used by the industry
 * scenarios in the website demo only.
 */
export type CallResult =
  | "recovered"
  | "link_sent_no_commit"
  | "declined"
  | "refused"
  | "wrong_number"
  | "no_answer"
  | "failed"
  | "appointment_booked"
  | "info_sent"
  | "callback_scheduled"
  | "handed_off";

/**
 * Actions the agent can take. The first five are the real tools in
 * voice/flow.py; the rest are illustrative tools used by the website
 * demo's industry scenarios and are built per client.
 */
export type AgentTool =
  | "send_retry_link"
  | "offer_declined"
  | "mark_do_not_contact"
  | "wrong_person"
  | "end_call"
  | "record_details"
  | "book_appointment"
  | "send_details"
  | "schedule_callback"
  | "handoff_to_human";

/**
 * Availability is shown on every capability/agent card so the site never
 * implies production support for something that isn't built.
 *
 * - live: running in a real implementation today
 * - preview: wired, but needs configuration or a later integration step
 * - demo: shown in the website simulation only
 * - custom: built per client on the same engine; not an off-the-shelf feature
 * - roadmap: not built yet
 */
export type Availability = "live" | "preview" | "demo" | "custom" | "roadmap";

export type IconName =
  | "phone"
  | "sun"
  | "moon"
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
  | "building"
  | "home"
  | "heart"
  | "medical"
  | "car"
  | "graduation"
  | "bed"
  | "umbrella"
  | "truck"
  | "wrench"
  | "bus"
  | "message"
  | "globe"
  | "dashboard"
  | "zap"
  | "target"
  | "phoneOutgoing"
  | "users"
  | "eye"
  | "plug";

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

/** Something a voice agent can do for a business (home page, "What your agent can do"). */
export interface UseCase {
  title: string;
  description: string;
  icon: IconName;
  availability: Availability;
  examples: string[];
}

export interface Industry {
  id: string;
  name: string;
  icon: IconName;
  summary: string;
  tasks: string[];
  /** Scope note shown on the card (e.g. no medical or insurance advice). */
  note?: string;
  /** Scenario id on /demo, when one exists. */
  demoScenario?: string;
}

/** A concrete call example for one industry (home page, "See it in your industry"). */
export interface IndustryExample {
  industry: string;
  icon: IconName;
  business: string;
  opener: string;
  asks: string[];
  actions: string[];
  note?: string;
  demoScenario?: string;
}

export interface Service {
  title: string;
  description: string;
  icon: IconName;
  points: string[];
}

export interface WorkflowStep {
  title: string;
  description: string;
  icon: IconName;
}

export interface Reason {
  title: string;
  description: string;
  icon: IconName;
}

/** Only ever real, permissioned quotes. See data/testimonials.ts. */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
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
  /** Details the agent has captured so far (field label → value). */
  collected?: Record<string, string>;
}

export type ScenarioGroup = "business" | "recovery";

export interface DemoScenario {
  id: string;
  /** "business": industry scenarios. "recovery": the Razorcovery payment flows. */
  group: ScenarioGroup;
  title: string;
  industry: string;
  icon: IconName;
  /** Fictional business the agent calls on behalf of. */
  business: string;
  agentName: string;
  customerName: string;
  language: "English" | "Hinglish";
  /** Why this call is happening. */
  trigger: string;
  /** What the agent is trying to achieve. */
  goal: string;
  /** Example of something the visitor could type. */
  sampleReply: string;
  /** Recovery scenarios only. */
  failureType?: FailureType;
  amountInr?: number;
  routingReason?: string;
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
