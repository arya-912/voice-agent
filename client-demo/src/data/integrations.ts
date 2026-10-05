import type { Integration } from "@/types";

/** Edit freely — the Integrations section renders whatever is here. */
export const integrations: Integration[] = [
  {
    name: "Google Gemini Live",
    category: "Voice & AI",
    description: "Native-audio model that handles speech-to-text, reasoning and speech in one Hinglish-capable model.",
    availability: "live",
  },
  {
    name: "LiveKit Agents",
    category: "Voice & AI",
    description: "Real-time media runtime for the agent worker, with turn detection and token-usage metering.",
    availability: "live",
  },
  {
    name: "SIP trunk via LiveKit",
    category: "Telephony",
    description: "Outbound PSTN calling through any SIP provider registered as a LiveKit trunk. Verified end to end with Vobiz.",
    availability: "live",
  },
  {
    name: "Other SIP providers",
    category: "Telephony",
    description: "Providers such as Twilio, Plivo or Exotel can be registered the same way. Not yet verified on a live call.",
    availability: "preview",
  },
  {
    name: "CSV / XLSX upload",
    category: "Data in",
    description: "Merchant contact sheets with fuzzy header matching, +91 normalisation and de-duplication.",
    availability: "live",
  },
  {
    name: "PostgreSQL",
    category: "Data in",
    description: "Audit trail, accounts and batches. Runs locally or on AWS RDS with TLS verification.",
    availability: "live",
  },
  {
    name: "CSV / JSON export",
    category: "Data out",
    description: "Per-row decision, outcome and transcript for every batch, ready for your BI or CRM import.",
    availability: "live",
  },
  {
    name: "JSON API & live stream",
    category: "Data out",
    description: "Summary, call and event endpoints, plus a server-sent-events feed for live batch progress.",
    availability: "live",
  },
  {
    name: "S3 call recordings",
    category: "Data out",
    description: "Call recordings exported to your own bucket and played back next to the transcript.",
    availability: "preview",
  },
  {
    name: "Razorpay Payment Links (test mode)",
    category: "Payments",
    description: "Real retry links via the Payment Links API. The provider interface is in place; the integration is the next pass.",
    availability: "roadmap",
  },
];
