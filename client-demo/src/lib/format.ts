import type { CallResult, FailureType } from "@/types";

export const formatInr = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

/** ₹9,12,400 → "₹9.1L"; keeps hero numbers short. */
export function formatInrCompact(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return formatInr(n);
}

export const formatPct = (r: number) => `${(r * 100).toFixed(1)}%`;

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const failureTypeLabel: Record<FailureType, string> = {
  payment_retry: "Payment retry",
  checkout_abandonment: "Checkout abandoned",
  mandate_failure: "Mandate failure",
};

export const callResultMeta: Record<
  CallResult,
  { label: string; tone: "good" | "neutral" | "warn" | "bad" }
> = {
  recovered: { label: "Recovered", tone: "good" },
  link_sent_no_commit: { label: "Link sent", tone: "neutral" },
  declined: { label: "Declined", tone: "warn" },
  refused: { label: "Do not contact", tone: "bad" },
  wrong_number: { label: "Wrong number", tone: "neutral" },
  no_answer: { label: "No answer", tone: "neutral" },
  failed: { label: "Failed", tone: "bad" },
};

export const stoppingRuleLabel: Record<string, string> = {
  call_window: "Outside 9am–7pm",
  max_attempts: "Max 2 attempts",
  explicit_refusal: "Explicit refusal",
};
