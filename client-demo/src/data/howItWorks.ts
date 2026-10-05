import type { Guardrail, Reason, Step } from "@/types";

/** How we work with a client. Custom builds, not a one-size-fits-all bot. */
export const steps: Step[] = [
  {
    title: "Understand your workflow",
    description: "We look at what your team does manually today: who they call, what they ask and what happens next.",
    icon: "eye",
    detail: "We start from one high-volume, repetitive call type.",
  },
  {
    title: "Design the AI agent",
    description: "We write the conversation flow, business rules and the actions the agent is allowed to take.",
    icon: "pen",
    detail: "You review the script and the guardrails before anything goes live.",
  },
  {
    title: "Connect your systems",
    description: "We connect the agent to your CRM, sheets, calendars, dashboards or database, wherever the work happens.",
    icon: "plug",
    detail: "Only the integrations you need, nothing more.",
  },
  {
    title: "Deploy & improve",
    description: "We launch the agent, review real conversations and outcomes with you, and keep improving it.",
    icon: "chart",
    detail: "Every call has a transcript and an outcome you can check.",
  },
];

/** "Why businesses choose us." No invented certifications, counts or percentages. */
export const whyUs: Reason[] = [
  {
    title: "Built around your business",
    description: "Your questions, your offers, your tone. Not a generic script with your logo on it.",
    icon: "building",
  },
  {
    title: "Follows your actual process",
    description: "The agent works through the same steps and rules your team would, and only takes the actions you allow.",
    icon: "route",
  },
  {
    title: "Humans stay in the loop",
    description: "The agent handles the repetitive calls. Complex, sensitive or high-value conversations go to your people.",
    icon: "headset",
  },
  {
    title: "Connected to your systems",
    description: "Answers and outcomes go into the tools you already use, so nobody has to copy them across.",
    icon: "plug",
  },
  {
    title: "Every conversation is reviewable",
    description: "Transcripts and outcomes for each call, so you can see what's working and what to change.",
    icon: "eye",
  },
  {
    title: "We've built it for real",
    description: "Our payment-recovery agent places real phone calls with business rules and an audit trail.",
    icon: "shieldCheck",
  },
];

/**
 * Responsible-design safeguards. These are implemented in the Razorcovery
 * payment-recovery agent; for new clients they are configured per project.
 */
export const safeguards: Guardrail[] = [
  {
    title: "Never asks for sensitive payment details",
    description: "No card numbers, CVV, OTP or UPI PIN. Payments happen on a secure link the customer opens themselves.",
    icon: "lock",
  },
  {
    title: "“Don't call me again” is respected",
    description: "An opt-out is recorded as an action, and the customer isn't contacted again.",
    icon: "ban",
  },
  {
    title: "Limits on how often it calls",
    description: "A maximum number of attempts per customer, after which it stops or switches to a gentler channel.",
    icon: "repeat",
  },
  {
    title: "Calls only during set hours",
    description: "A calling window checked in the customer's own time zone before every call.",
    icon: "clock",
  },
  {
    title: "Honest about being an AI",
    description: "The agent says it is an AI assistant, and doesn't invent offers, discounts or deadlines.",
    icon: "bot",
  },
  {
    title: "A record of every decision",
    description: "Each call, action and outcome is logged, so you can audit what happened and why.",
    icon: "list",
  },
];
