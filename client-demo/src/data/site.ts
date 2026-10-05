export const site = {
  name: "Razorcovery",
  tagline: "Voice agents that recover failed payments",
  description:
    "Razorcovery calls customers whose payments failed, explains what happened in natural Hinglish, and sends a secure retry link. Hard guardrails are built in, and every decision is written to an audit trail.",
  /** Placeholder — replace with the real sales inbox before sharing. */
  contactEmail: "",
};

export const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Use cases", href: "/#use-cases" },
  { label: "Demo", href: "/demo" },
  { label: "Contact", href: "/contact" },
];

export const availabilityLabel = {
  live: "Live",
  preview: "Partially built",
  roadmap: "Roadmap",
} as const;

export const availabilityHelp = {
  live: "Implemented and running in the current product.",
  preview: "Wired up but needs configuration or a later integration step.",
  roadmap: "Not built yet. Shown to illustrate where the same engine can go.",
} as const;
