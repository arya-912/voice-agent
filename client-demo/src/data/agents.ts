import type { AgentProfile } from "@/types";

/**
 * The first three agents are the three real call flows in voice/prompt.py.
 * The last two are concepts on the same engine and are labelled roadmap.
 */
export const agents: AgentProfile[] = [
  {
    id: "payment-retry",
    name: "Payment Retry Agent",
    purpose: "Calls customers whose payment was declined and helps them retry in two minutes.",
    icon: "creditCard",
    availability: "live",
    failureType: "payment_retry",
    routing: "Voice for ₹1,500 and above, SMS from ₹400, link only below that",
    capabilities: ["Identity check", "Explains the decline", "Sends secure retry link"],
    demoScenario: "payment_retry",
    sample: [
      { speaker: "agent", text: "Namaste, kya main Rohan Mehta se baat kar rahi hoon?", translation: "Hello, am I speaking with Rohan Mehta?" },
      { speaker: "customer", text: "Haan, boliye." , translation: "Yes, go ahead." },
      { speaker: "agent", text: "Aapka ₹2,499 ka payment bank ne decline kar diya tha. Main ek fresh secure link bhej doon?", translation: "Your bank declined the ₹2,499 payment. Shall I send a fresh secure link?" },
      { speaker: "customer", text: "Haan, bhej dijiye.", translation: "Yes, please send it." },
    ],
  },
  {
    id: "checkout-recovery",
    name: "Checkout Recovery Agent",
    purpose: "Reaches high-value carts that were abandoned at checkout before payment.",
    icon: "cart",
    availability: "live",
    failureType: "checkout_abandonment",
    routing: "Voice only for carts of ₹3,000 and above. Lower values get SMS or a link",
    capabilities: ["Order still reserved", "Low-pressure tone", "Link to finish checkout"],
    demoScenario: "checkout_abandonment",
    sample: [
      { speaker: "agent", text: "Aapka checkout adhura reh gaya tha. Aapka order abhi bhi reserved hai.", translation: "Your checkout wasn't completed. Your order is still reserved." },
      { speaker: "customer", text: "Haan, network chala gaya tha.", translation: "Yes, my network dropped." },
      { speaker: "agent", text: "Koi baat nahi. Main link bhej deti hoon, wahin se complete kar lijiye.", translation: "No problem. I'll send a link so you can finish from there." },
    ],
  },
  {
    id: "mandate-recovery",
    name: "Subscription Recovery Agent",
    purpose: "Follows up when an auto-pay mandate charge fails so the subscription doesn't lapse.",
    icon: "repeat",
    availability: "live",
    failureType: "mandate_failure",
    routing: "Revoked mandates go to link only (re-auth needed). Insufficient funds are routed by amount",
    capabilities: ["Explains auto-pay failure", "Manual payment link", "Mandate re-setup"],
    demoScenario: "mandate_failure",
    sample: [
      { speaker: "agent", text: "Aapka auto-pay charge is baar fail ho gaya. Main ek link bhejti hoon jisse aap manually clear kar sakein.", translation: "Your auto-pay charge failed this time. I'll send a link so you can clear it manually." },
      { speaker: "customer", text: "Kal tak kar dunga.", translation: "I'll do it by tomorrow." },
      { speaker: "agent", text: "Bilkul, main note kar leti hoon. Dhanyavaad!", translation: "Of course, I'll note that down. Thank you!" },
    ],
  },
  {
    id: "inbound-support",
    name: "Payment Support Line",
    purpose: "Answers inbound calls about failed or pending payments and sends the right link.",
    icon: "headset",
    availability: "roadmap",
    routing: "Concept: inbound SIP calls handled by the same tool-gated agent",
    capabilities: ["Inbound calls", "Status lookup", "Human handoff"],
    sample: [
      { speaker: "customer", text: "Mera payment kat gaya par order confirm nahi hua.", translation: "Money was debited but my order isn't confirmed." },
      { speaker: "agent", text: "Main check karti hoon. Kya aap order ID bata sakte hain?", translation: "Let me check. Could you share the order ID?" },
    ],
  },
  {
    id: "renewal-reminder",
    name: "Renewal Reminder Agent",
    purpose: "Calls before a subscription renews, so payment problems are caught before they happen.",
    icon: "bell",
    availability: "roadmap",
    routing: "Concept: proactive calls triggered ahead of a mandate debit",
    capabilities: ["Proactive outreach", "Payment-method check", "Same stopping rules"],
    sample: [
      { speaker: "agent", text: "Aapka plan 3 din mein renew hoga. Kya aapka auto-pay method abhi bhi active hai?", translation: "Your plan renews in 3 days. Is your auto-pay method still active?" },
      { speaker: "customer", text: "Card change hua hai, update karna padega.", translation: "My card changed, I need to update it." },
    ],
  },
];
