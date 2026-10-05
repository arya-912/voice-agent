import type { Service } from "@/types";

/** Our main offering. Rendered larger than everything else on purpose. */
export const primaryService: Service = {
  title: "AI Voice Agents",
  description:
    "Custom voice agents that call your leads and customers, hold a real conversation, and take the next step in your workflow. Built around your scripts, rules and systems, not a generic bot.",
  icon: "phoneOutgoing",
  points: [
    "Outbound calls to leads and customers",
    "Your questions, rules and tone of voice",
    "Actions: book, send, update, hand over",
    "Safeguards and a full record of every call",
  ],
};

/** Complementary services. They support the voice agents; they don't compete with them. */
export const secondaryServices: Service[] = [
  {
    title: "AI Chatbots",
    description: "Website and WhatsApp-style assistants that answer questions and capture leads, so your voice agent can call them.",
    icon: "message",
    points: ["Answers from your own material", "Lead capture and handoff"],
  },
  {
    title: "Custom Websites",
    description: "Business websites and customer-facing web apps that turn visitors into enquiries.",
    icon: "globe",
    points: ["Fast, accessible, responsive", "Forms wired to your workflow"],
  },
  {
    title: "Custom Software",
    description: "Internal tools and customer-facing software built for how your business actually runs.",
    icon: "code",
    points: ["Built to your requirements", "Integrates with what you use"],
  },
  {
    title: "Internal Dashboards",
    description: "Operational dashboards for reporting, analytics and monitoring your calls and workflows.",
    icon: "dashboard",
    points: ["Call outcomes and transcripts", "The numbers your team needs"],
  },
  {
    title: "AI Automation",
    description: "Integrations that connect AI agents to your CRM, sheets, calendars and databases.",
    icon: "zap",
    points: ["Connects your existing systems", "Removes manual hand-offs"],
  },
];
