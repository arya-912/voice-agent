import type { Industry, IndustryExample } from "@/types";

/**
 * Industries we build voice agents for. These are examples of the market,
 * not a limit. Each agent is built per client on the same engine.
 */
export const industries: Industry[] = [
  {
    id: "real-estate",
    name: "Real estate",
    icon: "home",
    summary: "Call every property enquiry, qualify it, and book site visits.",
    tasks: ["Lead qualification", "Property enquiries", "Site-visit booking", "Follow-ups"],
    demoScenario: "real_estate",
  },
  {
    id: "wedding-venues",
    name: "Wedding venues",
    icon: "heart",
    summary: "Answer availability enquiries and collect event requirements before your team calls.",
    tasks: ["Date & guest count", "Budget & venue type", "Venue visits", "Lead follow-ups"],
    demoScenario: "wedding_venue",
  },
  {
    id: "healthcare",
    name: "Medical & healthcare counters",
    icon: "medical",
    summary: "Handle appointment enquiries, reminders and routine questions at the front desk.",
    tasks: ["Appointment enquiries", "Reminder calls", "Timings & basic information", "Routing to staff"],
    note: "Front-desk tasks only. The agent never gives medical advice.",
  },
  {
    id: "car-dealerships",
    name: "Car dealerships",
    icon: "car",
    summary: "Qualify buyers, book test drives and call back every enquiry.",
    tasks: ["Buyer qualification", "Test-drive booking", "Sales enquiries", "Customer callbacks"],
    demoScenario: "car_dealership",
  },
  {
    id: "education",
    name: "Coaching & education",
    icon: "graduation",
    summary: "Follow up on course enquiries and book counselling sessions.",
    tasks: ["Course enquiries", "Lead qualification", "Counselling follow-ups", "Enrolment reminders"],
    demoScenario: "coaching",
  },
  {
    id: "hotels",
    name: "Hotels",
    icon: "bed",
    summary: "Respond to booking enquiries and keep guests informed.",
    tasks: ["Booking enquiries", "Guest communication", "Pre-arrival calls", "Follow-ups"],
    demoScenario: "hotel",
  },
  {
    id: "resorts",
    name: "Resorts",
    icon: "umbrella",
    summary: "Turn reservation enquiries into bookings and follow up with past guests.",
    tasks: ["Reservation enquiries", "Package information", "Guest communication", "Lead follow-ups"],
  },
  {
    id: "logistics",
    name: "Logistics",
    icon: "truck",
    summary: "Call customers about deliveries and handle routine operational calls.",
    tasks: ["Delivery confirmations", "Status calls", "Address & slot checks", "Operational workflows"],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    icon: "cart",
    summary: "Order calls, customer follow-ups and payment recovery, the workflow we already run.",
    tasks: ["Order confirmations", "Failed-payment recovery", "Abandoned checkouts", "Customer follow-ups"],
    demoScenario: "payment_retry",
  },
  {
    id: "insurance",
    name: "Insurance agencies",
    icon: "shield",
    summary: "Qualify quote requests and collect details for your advisors.",
    tasks: ["Lead qualification", "Renewal follow-ups", "Information collection", "Advisor callbacks"],
    note: "Collects information only. Advice comes from your licensed advisors.",
  },
  {
    id: "home-services",
    name: "Home services",
    icon: "wrench",
    summary: "Take service requests, book visits and follow up after the job.",
    tasks: ["Lead intake", "Service enquiries", "Visit scheduling", "Post-service follow-ups"],
    demoScenario: "home_services",
  },
  {
    id: "transportation",
    name: "Driver & transportation agencies",
    icon: "bus",
    summary: "Coordinate with drivers and customers, qualify enquiries and confirm schedules.",
    tasks: ["Driver communication", "Customer enquiries", "Lead qualification", "Scheduling"],
  },
];

/**
 * Concrete example calls for the home page. Businesses are fictional.
 * Where a matching /demo scenario exists, visitors can try the call.
 */
export const industryExamples: IndustryExample[] = [
  {
    industry: "Real estate",
    icon: "home",
    business: "Northgate Realty",
    opener: "Hi, this is Aisha, an AI assistant from Northgate Realty. You recently enquired about a 2BHK apartment in Whitefield. Are you still looking?",
    asks: ["Budget range", "Preferred location", "Buying timeline"],
    actions: ["Qualifies the lead", "Books a site visit", "Sends the brochure on request", "Forwards hot leads to an advisor"],
    demoScenario: "real_estate",
  },
  {
    industry: "Wedding venue",
    icon: "heart",
    business: "The Lotus Courtyard",
    opener: "Hello, this is Meera, an AI assistant from The Lotus Courtyard. Thank you for checking our availability. Could I ask a few quick questions about your event?",
    asks: ["Event date", "Number of guests", "Budget", "Lawn or banquet hall"],
    actions: ["Qualifies the enquiry", "Shares photos and packages", "Books a venue visit", "Arranges a call from the events manager"],
    demoScenario: "wedding_venue",
  },
  {
    industry: "Car dealership",
    icon: "car",
    business: "Velocity Motors",
    opener: "Hi, this is Arjun, an AI assistant from Velocity Motors. You asked for a callback about our new compact SUV. Is now a good time?",
    asks: ["Model and fuel type", "Budget", "Purchase timeline", "Test drive preference"],
    actions: ["Qualifies the buyer", "Books a home or showroom test drive", "Sends the price list", "Alerts the sales team"],
    demoScenario: "car_dealership",
  },
  {
    industry: "Coaching center",
    icon: "graduation",
    business: "BrightPath Academy",
    opener: "Hello, this is Kabir, an AI assistant from BrightPath Academy. You downloaded our course brochure. Can I help you find the right batch?",
    asks: ["Course of interest", "Current class", "Preferred batch", "Best way to contact"],
    actions: ["Records the requirement", "Books a counselling session", "Sends fee details", "Connects to a counsellor"],
    demoScenario: "coaching",
  },
  {
    industry: "Hotel",
    icon: "bed",
    business: "Harbour View Hotel",
    opener: "Hi, this is Riya, an AI assistant from Harbour View Hotel. You asked about rooms for a family trip. Can I help with dates and options?",
    asks: ["Travel dates", "Guests and rooms", "Room preference"],
    actions: ["Captures the request", "Sends a booking link", "Passes special requests to reception"],
    demoScenario: "hotel",
  },
  {
    industry: "Insurance agency",
    icon: "shield",
    business: "SecureCover Advisors",
    opener: "Hello, this is Dev, an AI assistant from SecureCover Advisors, calling about the health-insurance quote you requested. Do you have two minutes?",
    asks: ["Who needs cover", "Age of the eldest member", "Existing policy, if any", "Best time for an advisor to call"],
    actions: ["Collects the details", "Schedules a licensed-advisor callback", "Sends a plan brochure"],
    note: "The agent collects information only. It doesn't recommend plans or give insurance advice.",
  },
];
