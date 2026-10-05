import type { Guardrail, Step } from "@/types";

export const steps: Step[] = [
  {
    title: "Define the agent",
    description: "Set the agent's name, tone and call flow for your brand.",
    icon: "pen",
    detail: "Compliance guardrails are appended automatically and can't be edited away.",
  },
  {
    title: "Upload failed payments",
    description: "Drop in a CSV or XLSX sheet of payments that failed. Columns are detected for you.",
    icon: "upload",
    detail: "Rejected rows are listed with a reason, so nothing is dropped silently.",
  },
  {
    title: "Route and call",
    description: "Each payment gets a call, an SMS or a link, based on failure type and amount.",
    icon: "phone",
    detail: "Stopping rules are checked before dialing and again during the call.",
  },
  {
    title: "Monitor and improve",
    description: "Watch the batch live, read transcripts and track recovery rate and cost.",
    icon: "chart",
    detail: "Every number comes from the append-only audit trail.",
  },
];

/** Mirrors voice/prompt.py GUARDRAILS + decision/stopping_rules.py. */
export const guardrails: Guardrail[] = [
  {
    title: "Never asks for card, CVV, OTP or UPI PIN",
    description: "The agent only sends a secure link that the customer uses themselves.",
    icon: "lock",
  },
  {
    title: "“Don't call me again” is final",
    description: "A refusal fires a tool that blocks every channel for that customer. No more persuasion.",
    icon: "ban",
  },
  {
    title: "At most 2 call attempts",
    description: "After that, outreach is downgraded to a non-intrusive SMS.",
    icon: "repeat",
  },
  {
    title: "Calls only 9am–7pm local time",
    description: "The window is evaluated in the customer's own timezone, not the server's.",
    icon: "clock",
  },
  {
    title: "Honest about being an AI",
    description: "If asked directly, the agent says it is an AI assistant. It never invents discounts or deadlines.",
    icon: "bot",
  },
  {
    title: "Merchant's own customers only",
    description: "Every batch needs a consent attestation before a single call is placed.",
    icon: "shieldCheck",
  },
];
