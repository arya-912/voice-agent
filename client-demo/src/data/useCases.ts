import type { UseCase } from "@/types";

/**
 * What a voice agent can do for a business. "live" means it runs in a real
 * implementation today (the Razorcovery payment-recovery agent); "custom"
 * means we build it per client on the same engine. Keep this honest.
 */
export const useCases: UseCase[] = [
  {
    title: "Outbound calling",
    description: "The agent places real phone calls to your leads and customers, from a list or when something happens in your system.",
    icon: "phoneOutgoing",
    availability: "live",
    examples: ["Calls from an uploaded sheet", "Retry rules and calling hours", "Every call logged"],
  },
  {
    title: "Lead qualification",
    description: "Asks your qualifying questions, such as budget, location and timeline, and separates serious buyers from browsers.",
    icon: "target",
    availability: "custom",
    examples: ["Your questions, your criteria", "Answers saved to the lead", "Hot leads flagged for your team"],
  },
  {
    title: "Follow-ups",
    description: "Calls back every new enquiry within minutes, and follows up again on the schedule you set, so no lead goes cold.",
    icon: "repeat",
    availability: "custom",
    examples: ["New-enquiry callbacks", "No-answer retries", "Re-engaging old leads"],
  },
  {
    title: "Appointment & booking calls",
    description: "Offers available slots for site visits, test drives, consultations or venue tours, and confirms the booking.",
    icon: "calendar",
    availability: "custom",
    examples: ["Book a visit or session", "Confirm or reschedule", "Reminder calls"],
  },
  {
    title: "Customer notifications",
    description: "Calls customers about reminders, status changes and updates, and answers the questions that usually follow.",
    icon: "bell",
    availability: "custom",
    examples: ["Delivery and status updates", "Renewal and due-date reminders", "Service follow-ups"],
  },
  {
    title: "Sales conversations",
    description: "Introduces your product or service, answers common questions from your material, and collects requirements.",
    icon: "users",
    availability: "custom",
    examples: ["Product introductions", "Requirement gathering", "Brochure or price list on request"],
  },
  {
    title: "Payment & recovery follow-ups",
    description: "Calls customers about failed or incomplete payments, explains what happened, and sends a secure link to finish.",
    icon: "creditCard",
    availability: "live",
    examples: ["Declined payments", "Abandoned checkouts", "Failed auto-pay"],
  },
  {
    title: "Sends links & details",
    description: "Sends the right link or document after the call, such as a payment link, brochure, location or booking page.",
    icon: "send",
    availability: "preview",
    examples: ["Triggered by the conversation", "Only with the customer's consent", "Logged with the call"],
  },
  {
    title: "Human handoff",
    description: "When a conversation needs a person, the agent hands it over with a summary, as a callback task or a transfer.",
    icon: "headset",
    availability: "custom",
    examples: ["Customer asks for a person", "Complaints and edge cases", "Full context passed on"],
  },
  {
    title: "Transcripts & outcomes",
    description: "Every call is recorded as a transcript with its outcome, so your team can review what was said and what happened next.",
    icon: "list",
    availability: "live",
    examples: ["Full transcript per call", "Outcome and actions logged", "Export for your CRM or BI"],
  },
  {
    title: "Inbound enquiry calls",
    description: "Answers incoming calls with the same rules and actions, so enquiries outside office hours still get a response.",
    icon: "headset",
    availability: "roadmap",
    examples: ["After-hours enquiries", "Same safeguards as outbound", "Handoff to your team"],
  },
  {
    title: "Hindi, English & Hinglish",
    description: "Speaks the way your customers do, including natural Hindi–English mixing, and follows them if they switch.",
    icon: "languages",
    availability: "live",
    examples: ["Hinglish live today", "English", "More languages on request"],
  },
];
