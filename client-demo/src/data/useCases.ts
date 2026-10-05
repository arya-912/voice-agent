import type { UseCase } from "@/types";

/**
 * Industries are applications of the three live recovery flows — not
 * separate products. Roadmap entries are explicitly labelled.
 */
export const useCases: UseCase[] = [
  {
    title: "D2C & e-commerce",
    description: "Recover declined card payments and high-value carts dropped at the payment step.",
    icon: "cart",
    availability: "live",
    examples: ["Card declined at checkout", "Cart abandoned at ₹3,000+", "Prepaid order left unpaid"],
  },
  {
    title: "Subscriptions & SaaS",
    description: "Stop involuntary churn when an auto-pay mandate fails or is revoked.",
    icon: "repeat",
    availability: "live",
    examples: ["Mandate debit failed", "Insufficient funds on renewal", "Mandate revoked, re-auth needed"],
  },
  {
    title: "Education & online services",
    description: "Follow up on course fees and service bookings that failed partway through payment.",
    icon: "building",
    availability: "live",
    examples: ["Course-fee payment failed", "Instalment mandate failed", "Booking left unpaid"],
  },
  {
    title: "Travel & hospitality",
    description: "Recover bookings where the customer reached payment but never completed it.",
    icon: "calendar",
    availability: "live",
    examples: ["Room booking unpaid", "Payment timed out", "Customer asked to pay later"],
  },
  {
    title: "Inbound payment support",
    description: "Answer “money debited but order not confirmed” calls without a human queue.",
    icon: "headset",
    availability: "roadmap",
    examples: ["Payment status questions", "Resend link on request", "Escalate to a human"],
  },
  {
    title: "Proactive renewal reminders",
    description: "Call before a renewal fails, not after, when the card on file is likely to bounce.",
    icon: "bell",
    availability: "roadmap",
    examples: ["Card expiring before renewal", "Mandate about to debit", "Plan-change confirmation"],
  },
];
