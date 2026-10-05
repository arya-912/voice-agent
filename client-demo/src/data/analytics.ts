import type { AnalyticsSummary, CallLogRow } from "@/types";

/**
 * ILLUSTRATIVE SAMPLE DATA — not customer results.
 *
 * Shaped like the core app's GET /api/summary and GET /api/calls so the
 * dashboard preview can switch to real data by changing the source in
 * lib/api.ts, without touching the components.
 */
export const sampleSummary: AnalyticsSummary = {
  total_events: 320,
  contacted: 184,
  recovered: 79,
  amount_at_risk_inr: 912_400,
  amount_recovered_inr: 268_350,
  recovery_rate: 0.4293,
  by_failure_type: [
    { key: "payment_retry", events: 148, contacted: 96, recovered: 46, amount_at_risk_inr: 402_100, amount_recovered_inr: 141_900, recovery_rate: 0.4792 },
    { key: "checkout_abandonment", events: 101, contacted: 44, recovered: 15, amount_at_risk_inr: 318_700, amount_recovered_inr: 74_250, recovery_rate: 0.3409 },
    { key: "mandate_failure", events: 71, contacted: 44, recovered: 18, amount_at_risk_inr: 191_600, amount_recovered_inr: 52_200, recovery_rate: 0.4091 },
  ],
  stopping_rule_counts: { call_window: 21, max_attempts: 9, explicit_refusal: 6 },
  effort: { total_call_minutes: 287.5, total_attempts: 212, cost_per_recovery_inr: 3.1 },
};

export const sampleCalls: CallLogRow[] = [
  { event_id: "evt_s01", customer_name: "R. Mehta", ts: "2026-10-05T11:42:00+05:30", amount_inr: 2499, failure_type: "payment_retry", duration_s: 74, result: "recovered" },
  { event_id: "evt_s02", customer_name: "A. Iyer", ts: "2026-10-05T11:38:00+05:30", amount_inr: 4200, failure_type: "checkout_abandonment", duration_s: 96, result: "recovered" },
  { event_id: "evt_s03", customer_name: "V. Singh", ts: "2026-10-05T11:31:00+05:30", amount_inr: 1999, failure_type: "mandate_failure", duration_s: 58, result: "declined" },
  { event_id: "evt_s04", customer_name: "S. Kulkarni", ts: "2026-10-05T11:24:00+05:30", amount_inr: 3150, failure_type: "payment_retry", duration_s: 12, result: "wrong_number" },
  { event_id: "evt_s05", customer_name: "M. Das", ts: "2026-10-05T11:18:00+05:30", amount_inr: 5600, failure_type: "checkout_abandonment", duration_s: 41, result: "refused" },
];
