import type { DemoScenario } from "@/types";
import { RECOVERY_AGENT_NAME, buildRecoveryScript } from "./demoConversations";
import { buildLeadCallScript, summarise, type LeadCallSpec, type Script } from "./demoScript";

/**
 * Every scenario on /demo. To add one: write a `LeadCallSpec` (or a custom
 * Script builder) and add an entry below. Businesses and customers are
 * fictional. These are simulations, not the production model.
 */

interface ScenarioDef {
  meta: DemoScenario;
  build: () => Script;
}

type LeadMeta = Omit<DemoScenario, "group" | "language" | "failureType" | "amountInr" | "routingReason">;

const lead = (meta: LeadMeta, spec: Omit<LeadCallSpec, "agentName" | "business" | "customerName">): ScenarioDef => ({
  meta: { ...meta, group: "business", language: "English" },
  build: () => buildLeadCallScript({ ...spec, agentName: meta.agentName, business: meta.business, customerName: meta.customerName }),
});

const defs: ScenarioDef[] = [
  lead(
    {
      id: "real_estate",
      title: "Real estate lead",
      industry: "Real estate",
      icon: "home",
      business: "Northgate Realty",
      agentName: "Aisha",
      customerName: "Karan Malhotra",
      trigger: "Enquired about a 2BHK in Whitefield on the website 15 minutes ago.",
      goal: "Qualify the lead and book a site visit.",
      sampleReply: "My budget is around 85 lakh",
    },
    {
      intro: "You recently enquired about a 2BHK apartment at our Whitefield project. I'd love to help you find the right fit.",
      questions: [
        { field: "Budget", ask: "What budget range are you considering?", options: [{ label: "₹60–80 lakh" }, { label: "₹80 lakh – 1 crore" }, { label: "Above ₹1 crore" }] },
        { field: "Location", ask: "Is Whitefield your preferred area, or are you open to nearby locations?", options: [{ label: "Whitefield only" }, { label: "Open to nearby areas" }, { label: "I prefer Sarjapur Road", value: "Sarjapur Road" }] },
        { field: "Timeline", ask: "And when are you planning to buy?", options: [{ label: "Within 3 months" }, { label: "In 3–6 months" }, { label: "Just exploring" }] },
      ],
      offer: () => "Thank you, Karan. Based on that, I'd suggest seeing the project in person. Would you like a site visit this weekend? I have Saturday at 11 am or Sunday at 4 pm.",
      choices: [
        { id: "sat", label: "Saturday 11 am works", text: "Saturday at 11 works for me.", match: /\b(sat|saturday|11)\b/i, tool: "book_appointment", detail: () => "Site visit booked · Sat 11:00 · advisor notified", say: () => "Done. Your site visit is booked for Saturday at 11 am, and you'll get the location on WhatsApp. An advisor will meet you there. Thank you, Karan!", result: "appointment_booked" },
        { id: "sun", label: "Sunday 4 pm", text: "Sunday at 4 pm, please.", match: /\b(sun|sunday|4)\b/i, tool: "book_appointment", detail: () => "Site visit booked · Sun 16:00 · advisor notified", say: () => "Done. Your site visit is booked for Sunday at 4 pm. You'll get the location on WhatsApp. Thank you, Karan!", result: "appointment_booked" },
        { id: "brochure", label: "Just send the brochure", text: "Just send me the brochure for now.", match: /(brochure|details|send|whatsapp|email)/i, tool: "send_details", detail: () => "Brochure and floor plans sent on WhatsApp · follow-up in 3 days", say: () => "Sure. I've sent the brochure and floor plans on WhatsApp. I'll check back in a few days in case you'd like to visit. Thank you!", result: "info_sent" },
      ],
      handoffDetail: (a) => `Advisor callback requested · ${summarise(a)}`,
    },
  ),
  lead(
    {
      id: "car_dealership",
      title: "Car dealership lead",
      industry: "Car dealership",
      icon: "car",
      business: "Velocity Motors",
      agentName: "Arjun",
      customerName: "Sneha Rao",
      trigger: "Asked for a callback about the new compact SUV from an online ad.",
      goal: "Qualify the buyer and book a test drive.",
      sampleReply: "Petrol automatic, around 12 lakh",
    },
    {
      intro: "You asked us to call you about our new compact SUV. I'll ask a few quick questions so we can show you the right variant.",
      questions: [
        { field: "Variant", ask: "Which version are you interested in?", options: [{ label: "Petrol automatic" }, { label: "Diesel manual" }, { label: "Not sure yet" }] },
        { field: "Budget", ask: "What's your budget, roughly?", options: [{ label: "₹8–10 lakh" }, { label: "₹10–13 lakh" }, { label: "Above ₹13 lakh" }] },
        { field: "Timeline", ask: "When are you planning to buy?", options: [{ label: "This month" }, { label: "In 1–3 months" }, { label: "Just comparing" }] },
      ],
      offer: () => "Thanks, Sneha. The best way to decide is to drive it. Would you like a test drive? We can bring the car to your home, or you can visit the showroom.",
      choices: [
        { id: "home", label: "Home test drive", text: "A test drive at home would be great.", match: /\b(home|house|ghar)\b/i, tool: "book_appointment", detail: () => "Home test drive booked · Sat 10:30 · sales executive assigned", say: () => "Lovely. I've booked a home test drive for Saturday at 10:30 am. A sales executive will confirm the address by message. Thank you, Sneha!", result: "appointment_booked" },
        { id: "showroom", label: "I'll visit the showroom", text: "I'll come to the showroom.", match: /(showroom|visit|come)/i, tool: "book_appointment", detail: () => "Showroom test drive booked · Sun 12:00", say: () => "Great. You're booked for a test drive at our showroom on Sunday at 12 noon. I'll send the location now. Thank you!", result: "appointment_booked" },
        { id: "pricelist", label: "Send me the price list", text: "Just send me the price list.", match: /(price|list|quote|send)/i, tool: "send_details", detail: () => "On-road price list sent on WhatsApp", say: () => "Sure. I've sent the on-road price list on WhatsApp. Whenever you're ready for a test drive, just reply there. Thank you!", result: "info_sent" },
      ],
    },
  ),
  lead(
    {
      id: "wedding_venue",
      title: "Wedding venue inquiry",
      industry: "Wedding venue",
      icon: "heart",
      business: "The Lotus Courtyard",
      agentName: "Meera",
      customerName: "Ritika Sharma",
      trigger: "Filled in the “check availability” form on the venue's website.",
      goal: "Collect event requirements and arrange a visit or a call with the events team.",
      sampleReply: "About 300 guests in February",
    },
    {
      intro: "Thank you for checking availability with us. I'll ask a few quick questions so our events team can come back with the right options. I can't confirm dates myself, but I'll make sure they check.",
      questions: [
        { field: "Event date", ask: "Which date are you considering?", options: [{ label: "Mid-December" }, { label: "February 2027" }, { label: "Our dates are flexible", value: "Flexible" }] },
        { field: "Guests", ask: "Roughly how many guests are you expecting?", options: [{ label: "Up to 200" }, { label: "200–400" }, { label: "More than 400" }] },
        { field: "Budget", ask: "Do you have a budget range in mind?", options: [{ label: "Under ₹15 lakh" }, { label: "₹15–25 lakh" }, { label: "Above ₹25 lakh" }] },
        { field: "Venue", ask: "Last one: would you prefer the lawn, the banquet hall, or both?", options: [{ label: "Lawn" }, { label: "Banquet hall" }, { label: "Both" }] },
      ],
      offer: () => "Thank you, Ritika, that's everything I need. Would you like to visit the venue, or should our events manager call you with availability and a quote?",
      choices: [
        { id: "visit", label: "Book a venue visit", text: "I'd like to visit the venue.", match: /(visit|see|come|tour)/i, tool: "book_appointment", detail: () => "Venue visit booked · Sat 4:00 pm · events manager notified", say: () => "Wonderful. I've booked a venue visit for Saturday at 4 pm, and the events manager will have your requirements ready. Thank you, Ritika!", result: "appointment_booked" },
        { id: "manager", label: "Have the manager call me", text: "Please have the manager call me.", match: /(manager|call me|quote)/i, tool: "handoff_to_human", detail: () => "Events manager callback · requirements attached to the enquiry", say: () => "Of course. I've passed your requirements to our events manager, who will call you today with availability and a quote. Thank you!", result: "handed_off" },
        { id: "photos", label: "Send photos and packages", text: "Can you send photos and packages first?", match: /(photo|package|pictures|brochure|send)/i, tool: "send_details", detail: () => "Venue photos and packages sent on WhatsApp", say: () => "Sure. I've sent photos and our wedding packages on WhatsApp. I'll check in after you've had a look. Thank you!", result: "info_sent" },
      ],
    },
  ),
  lead(
    {
      id: "coaching",
      title: "Coaching center inquiry",
      industry: "Coaching & education",
      icon: "graduation",
      business: "BrightPath Academy",
      agentName: "Kabir",
      customerName: "Anjali Verma",
      trigger: "Downloaded the course brochure on the website.",
      goal: "Understand the requirement and book a counselling session.",
      sampleReply: "NEET, my son is in class 11",
    },
    {
      intro: "You downloaded our course brochure. I'd like to help you find the right course and batch.",
      questions: [
        { field: "Course", ask: "Which course are you interested in?", options: [{ label: "JEE Main + Advanced" }, { label: "NEET" }, { label: "Foundation, class 9–10", value: "Foundation (class 9–10)" }] },
        { field: "Class", ask: "Which class is the student in right now?", options: [{ label: "Class 11" }, { label: "Class 12" }, { label: "Repeating the year", value: "Dropper" }] },
        { field: "Batch", ask: "Which batch timing would suit you?", options: [{ label: "Weekday evenings" }, { label: "Weekends" }, { label: "Online" }] },
        { field: "Contact by", ask: "And how would you prefer we contact you?", options: [{ label: "Phone call" }, { label: "WhatsApp" }, { label: "Email" }] },
      ],
      offer: () => "Thank you, Anjali. Would you like to book a free counselling session with one of our senior counsellors? They can take you through batches and fees.",
      choices: [
        { id: "session", label: "Book a session", text: "Yes, please book a session.", tool: "book_appointment", detail: () => "Counselling session booked · Sat 5:00 pm · counsellor assigned", say: () => "Done. Your counselling session is booked for Saturday at 5 pm. You'll get a confirmation shortly. Thank you, Anjali!", result: "appointment_booked" },
        { id: "fees", label: "Send fee details", text: "Just send the fee details for now.", match: /(fee|fees|details|send|whatsapp)/i, tool: "send_details", detail: () => "Fee structure and batch timings sent", say: () => "Sure. I've sent the fee structure and batch timings. A counsellor will follow up in a couple of days. Thank you!", result: "info_sent" },
      ],
      handoffDetail: () => "Counsellor callback requested · requirement attached",
    },
  ),
  lead(
    {
      id: "hotel",
      title: "Hotel inquiry",
      industry: "Hotel",
      icon: "bed",
      business: "Harbour View Hotel",
      agentName: "Riya",
      customerName: "Daniel Fernandes",
      trigger: "Asked about rooms for a family trip through the website chat.",
      goal: "Capture the request and send a booking link.",
      sampleReply: "December 20 to 23, two adults and two kids",
    },
    {
      intro: "You asked us about rooms for a family trip. I can help with dates and options.",
      questions: [
        { field: "Dates", ask: "Which dates are you looking at?", options: [{ label: "20–23 December" }, { label: "New Year week" }, { label: "Dates aren't fixed yet", value: "Flexible" }] },
        { field: "Guests", ask: "How many guests, and how many rooms?", options: [{ label: "2 adults, 1 room" }, { label: "2 adults + 2 kids" }, { label: "Group of 6 or more" }] },
        { field: "Room", ask: "Do you have a room preference?", options: [{ label: "Sea-view room" }, { label: "Family suite" }, { label: "Best value" }] },
      ],
      offer: () => "Thank you, Daniel. I can send you a booking link with those options so you can see live rates and confirm. Shall I send it?",
      choices: [
        { id: "link", label: "Yes, send the link", text: "Yes, please send the link.", tool: "send_details", detail: () => "Booking link sent with dates and room type pre-filled", say: () => "Done. The booking link is on its way with your dates and room type filled in. If you have special requests, just reply to that message. Thank you!", result: "info_sent" },
        { id: "reception", label: "Connect me to reception", text: "Can you connect me to reception?", match: /(reception|front desk|connect)/i, tool: "handoff_to_human", detail: () => "Reception callback · request details attached", say: () => "Of course. I've passed your request to reception, and they'll call you back shortly. Thank you, Daniel!", result: "handed_off" },
      ],
    },
  ),
  lead(
    {
      id: "home_services",
      title: "Customer follow-up",
      industry: "Home services",
      icon: "wrench",
      business: "FixRight Home Services",
      agentName: "Neha",
      customerName: "Sameer Khan",
      trigger: "AC service was completed three days ago.",
      goal: "Check the customer is happy, log feedback, and offer the next service.",
      sampleReply: "The technician was good, all fine now",
    },
    {
      intro: "I'm calling about the AC service we did at your home on Monday. I just wanted to check how everything is.",
      questions: [
        { field: "Feedback", ask: "How was the service?", options: [{ label: "Very good" }, { label: "It was okay" }, { label: "I had an issue", value: "Had an issue", escalate: true }], escalateIf: /(issue|problem|bad|poor|not happy|unhappy|complain|rude|late)/i },
        { field: "AC status", ask: "Is the AC cooling properly now?", options: [{ label: "Yes, all good" }, { label: "Still a problem", escalate: true }], escalateIf: /(not cooling|still not|still (a )?problem|not working|broken|leak|noise|warm|hot)/i },
      ],
      offer: () => "Glad to hear it, Sameer. Your next service is due in about three months. Would you like me to book it now, or send you details of our annual maintenance plan?",
      choices: [
        { id: "book", label: "Book the next service", text: "Yes, book the next service.", tool: "book_appointment", detail: () => "Next service booked · in 3 months · reminder set", say: () => "Done. Your next service is booked for three months from now, and we'll remind you a few days before. Thank you, Sameer!", result: "appointment_booked" },
        { id: "amc", label: "Send the AMC details", text: "Send me the annual plan details.", match: /(amc|annual|plan|details|send)/i, tool: "send_details", detail: () => "Annual maintenance plan details sent", say: () => "Sure, I've sent the plan details on WhatsApp. Thank you for choosing FixRight!", result: "info_sent" },
      ],
      handoffDetail: (a) => `Complaint raised · technician callback requested · ${summarise(a)}`,
    },
  ),
];

/* Razorcovery payment-recovery flows (the production call flow, simulated). */
const recovery = (meta: Omit<DemoScenario, "group" | "language" | "agentName" | "icon" | "industry" | "sampleReply"> & { failureType: NonNullable<DemoScenario["failureType"]>; amountInr: number }): ScenarioDef => {
  const full = { ...meta, group: "recovery" as const, language: "Hinglish" as const, agentName: RECOVERY_AGENT_NAME, icon: "creditCard" as const, industry: "Payment recovery", sampleReply: "kal tak kar dunga" };
  return { meta: full, build: () => buildRecoveryScript(full) };
};

defs.push(
  recovery({
    id: "payment_retry",
    title: "Payment follow-up",
    failureType: "payment_retry",
    customerName: "Rohan Mehta",
    business: "Kavya Home Store",
    amountInr: 2499,
    trigger: "Card payment declined by the issuing bank (card_declined). First call attempt.",
    goal: "Explain the failure and, with consent, send a secure retry link.",
    routingReason: "payment_retry, amount ₹2,499 ≥ ₹1,500 → voice",
  }),
  recovery({
    id: "checkout_abandonment",
    title: "Abandoned high-value cart",
    failureType: "checkout_abandonment",
    customerName: "Ananya Iyer",
    business: "Saanjh Living",
    amountInr: 4200,
    trigger: "Customer closed the checkout before paying (checkout_closed). Order still reserved.",
    goal: "Let the customer know the order is reserved and send a link to finish.",
    routingReason: "checkout_abandonment, cart ₹4,200 ≥ ₹3,000 → voice",
  }),
  recovery({
    id: "mandate_failure",
    title: "Failed subscription auto-pay",
    failureType: "mandate_failure",
    customerName: "Vikram Singh",
    business: "StreamBox Premium",
    amountInr: 1999,
    trigger: "Monthly mandate debit failed (mandate_insufficient_funds).",
    goal: "Explain the failed auto-pay and send a manual payment link.",
    routingReason: "mandate_failure (insufficient funds), ₹1,999 ≥ ₹1,500 → voice",
  }),
);

export const scenarios: DemoScenario[] = defs.map((d) => d.meta);

export const DEFAULT_SCENARIO = "real_estate";

export function buildScript(scenarioId: string): Script | undefined {
  return defs.find((d) => d.meta.id === scenarioId)?.build();
}
