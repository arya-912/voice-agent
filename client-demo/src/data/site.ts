export const site = {
  /**
   * PLACEHOLDER brand. The repo has no company name yet (Razorcovery is a
   * product we built, not the company), so the site uses a descriptive
   * wordmark. Replace with the real company name before sharing.
   */
  name: "AI Voice Agents",
  tagline: "AI voice agents that talk to your customers",
  description:
    "We build AI voice agents that call your leads and customers, understand what they say, and take the next step: qualify, book, follow up, or hand over to your team. Plus the chatbots, websites and software around them.",
  /** Placeholder — replace with the real sales inbox before sharing. */
  contactEmail: "",
};

export const navLinks = [
  { label: "Voice agents", href: "/#voice-agents" },
  { label: "Industries", href: "/#industries" },
  { label: "Solutions", href: "/#solutions" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Case study", href: "/work/razorcovery" },
  { label: "Contact", href: "/contact" },
];

export const availabilityLabel = {
  live: "Live",
  preview: "Partially built",
  demo: "Demo",
  custom: "Custom build",
  roadmap: "Roadmap",
} as const;

export const availabilityHelp = {
  live: "Running in a real implementation today.",
  preview: "Wired up but needs configuration or a later integration step.",
  demo: "Shown in the website simulation. Built for real per client.",
  custom: "Built for each client on the same voice-agent engine, around their workflow and systems.",
  roadmap: "Not built yet. Shown to illustrate where the same engine can go.",
} as const;
