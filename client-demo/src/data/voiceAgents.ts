import type { IconName, Reason, WorkflowStep } from "@/types";

/** Short strip under the hero: what every agent call involves. */
export const capabilityStrip: { icon: IconName; text: string }[] = [
  { icon: "phoneOutgoing", text: "Makes real phone calls" },
  { icon: "message", text: "Understands natural replies" },
  { icon: "zap", text: "Takes the next action" },
  { icon: "headset", text: "Hands over to your team" },
  { icon: "languages", text: "English, Hindi & Hinglish" },
];

/** "Why AI voice agents?" Problems a business recognises, not technology. */
export const whyVoice: Reason[] = [
  {
    title: "Leads go cold while they wait",
    description: "A new enquiry is most interested in the first few minutes. Your agent can call back right away, any time during calling hours.",
    icon: "clock",
  },
  {
    title: "Your team spends the day on repetitive calls",
    description: "Confirmations, reminders and first-round qualifying are the same conversation over and over. Let the agent take those.",
    icon: "repeat",
  },
  {
    title: "Follow-up depends on who remembers",
    description: "The agent follows up every time, asks the same questions every time, and writes down what the customer said.",
    icon: "list",
  },
  {
    title: "People still answer the phone",
    description: "A call gets an answer and a conversation where a message gets ignored. The agent sends the link or details after it talks.",
    icon: "phone",
  },
];

/** "What can your AI agent do?" A typical lead workflow, end to end. */
export const agentWorkflow: WorkflowStep[] = [
  { title: "A lead comes in", description: "From your website, an ad, a sheet or your CRM.", icon: "user" },
  { title: "The agent calls", description: "Within minutes, during the hours you allow.", icon: "phoneOutgoing" },
  { title: "It understands the conversation", description: "Natural replies, not press-1-for-yes menus.", icon: "message" },
  { title: "It qualifies the lead", description: "Asks your questions and checks your criteria.", icon: "target" },
  { title: "It updates your system", description: "Answers and outcome saved where your team works.", icon: "database" },
  { title: "It books the next step", description: "A visit, test drive, callback or session.", icon: "calendar" },
  { title: "Your team takes over", description: "Qualified leads and tricky cases go to a person.", icon: "headset" },
];
