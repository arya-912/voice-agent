import type { Capability } from "@/types";

/**
 * Every "live" entry maps to code in the core repo (see `source`). Keep
 * this list honest: if something isn't built, mark it preview/roadmap.
 */
export const capabilities: Capability[] = [
  {
    title: "Natural Hinglish conversations",
    description:
      "Speaks and understands Hindi–English code-switching the way real Indian support callers do. If the customer switches to English, the agent follows.",
    icon: "languages",
    availability: "live",
    source: "Gemini Live native audio",
  },
  {
    title: "Real outbound phone calls",
    description:
      "Places calls over a SIP trunk through LiveKit. Live PSTN calls have been placed and answered on the production setup.",
    icon: "phone",
    availability: "live",
    source: "voice/dialer.py",
  },
  {
    title: "Actions only through tools",
    description:
      "Nothing the model says moves state. Sending a link, logging a refusal or ending the call each goes through a typed, logged tool.",
    icon: "shieldCheck",
    availability: "live",
    source: "voice/flow.py",
  },
  {
    title: "Smart channel routing",
    description:
      "Each failure is routed to a call, an SMS or a link only, based on failure type, amount and error code, and the reason is written down.",
    icon: "route",
    availability: "live",
    source: "decision/rules.py",
  },
  {
    title: "Stopping rules in code",
    description:
      "Explicit refusals, a maximum of 2 call attempts and a 9am–7pm local calling window are enforced before dialing and checked again on the call.",
    icon: "ban",
    availability: "live",
    source: "decision/stopping_rules.py",
  },
  {
    title: "Append-only audit trail",
    description:
      "Every ingest, decision, call and outcome is a row the database won't let anyone edit or delete. Transcripts are stored with the outcome.",
    icon: "list",
    availability: "live",
    source: "audit/",
  },
  {
    title: "Bulk intake from a sheet",
    description:
      "Upload a CSV or XLSX of failed payments. Columns are auto-detected, phone numbers normalised and duplicates removed. Every rejected row comes with a reason.",
    icon: "upload",
    availability: "live",
    source: "intake/",
  },
  {
    title: "Recovery dashboard",
    description:
      "Recovery rate, ₹ recovered, call logs with transcripts, and real LLM cost per recovery, all computed from the audit trail with no seeded numbers.",
    icon: "chart",
    availability: "live",
    source: "metrics/",
  },
  {
    title: "Editable agent persona",
    description:
      "Tune the name, tone and call flow per workspace, with version history and rollback. Compliance guardrails are always appended and can't be edited.",
    icon: "pen",
    availability: "live",
    source: "voice/agent_prompt.py",
  },
  {
    title: "Call recordings",
    description:
      "Recording capture and playback are wired into the call view. They need an S3 bucket to be configured.",
    icon: "volume",
    availability: "preview",
  },
  {
    title: "Payment-link generation",
    description:
      "Retry links are produced behind a provider interface. Today a safe stub is used; a Razorpay test-mode Payment Links provider is the next step.",
    icon: "link",
    availability: "preview",
  },
  {
    title: "SMS delivery & human handoff",
    description:
      "SMS and link-only routes are decided and logged, but not yet sent. Warm transfer to a human agent is planned.",
    icon: "headset",
    availability: "roadmap",
  },
];
