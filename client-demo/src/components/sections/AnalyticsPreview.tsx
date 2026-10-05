import { ANALYTICS_IS_SAMPLE, getAnalyticsSummary, getRecentCalls } from "@/lib/api";
import {
  failureTypeLabel,
  formatDuration,
  formatInr,
  formatInrCompact,
  formatPct,
  stoppingRuleLabel,
} from "@/lib/format";
import type { FailureType } from "@/types";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { ResultBadge } from "../ResultBadge";
import { Stats } from "../Stats";
import { Container, SectionHeading } from "../ui";

export async function AnalyticsPreview() {
  const [s, calls] = await Promise.all([getAnalyticsSummary(), getRecentCalls(5)]);
  const avgCallS = s.effort.total_attempts ? (s.effort.total_call_minutes * 60) / s.effort.total_attempts : 0;
  const maxRate = Math.max(...s.by_failure_type.map((b) => b.recovery_rate), 0.0001);

  return (
    <section id="analytics" aria-labelledby="analytics-title" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="analytics-title"
          eyebrow="Monitoring"
          title="See exactly what every call recovered and what it cost."
          description="The dashboard is computed from the audit trail on every request. It shows recovery rate, rupees recovered, why each unrecovered event stopped, and real LLM cost per recovery."
        />

        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-2xl bg-paper shadow-lift ring-1 ring-line">
            {/* window chrome */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-line-strong" />
                  <span className="size-2.5 rounded-full bg-line-strong" />
                  <span className="size-2.5 rounded-full bg-line-strong" />
                </span>
                <span className="ml-2 text-sm font-medium text-ink">Recovery dashboard</span>
              </div>
              {ANALYTICS_IS_SAMPLE && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-700/20 ring-inset dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25">
                  <Icon name="alert" className="size-3.5" />
                  Illustrative sample data, not customer results
                </span>
              )}
            </div>

            <div className="space-y-6 p-4 sm:p-6">
              <Stats
                items={[
                  { label: "Recovery rate", value: formatPct(s.recovery_rate), hint: `${s.recovered} of ${s.contacted} contacted` },
                  { label: "Recovered", value: formatInrCompact(s.amount_recovered_inr), hint: `of ${formatInrCompact(s.amount_at_risk_inr)} at risk` },
                  { label: "Call attempts", value: s.effort.total_attempts.toString(), hint: `avg ${formatDuration(avgCallS)} per call` },
                  { label: "LLM cost / recovery", value: `₹${s.effort.cost_per_recovery_inr.toFixed(2)}`, hint: "real token usage × list price" },
                ]}
              />

              <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="rounded-xl bg-surface p-5 ring-1 ring-line">
                  <h3 className="text-sm font-semibold text-ink">Recovery rate by failure type</h3>
                  <ul className="mt-5 space-y-4">
                    {s.by_failure_type.map((b) => (
                      <li key={b.key} title={`${b.recovered} recovered of ${b.contacted} contacted · ${formatInr(b.amount_recovered_inr)} recovered`}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-ink-2">{failureTypeLabel[b.key as FailureType] ?? b.key}</span>
                          <span className="font-medium text-ink tabular-nums">{formatPct(b.recovery_rate)}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-paper" aria-hidden>
                          <div className="h-2 rounded-full bg-brand" style={{ width: `${(b.recovery_rate / maxRate) * 100}%` }} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted">
                          {b.recovered}/{b.contacted} contacted · {formatInrCompact(b.amount_recovered_inr)} recovered
                        </p>
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-7 text-sm font-semibold text-ink">Stopping rules triggered</h3>
                  <ul className="mt-3 divide-y divide-line text-sm">
                    {Object.entries(s.stopping_rule_counts).map(([rule, n]) => (
                      <li key={rule} className="flex justify-between py-2">
                        <span className="text-ink-2">{stoppingRuleLabel[rule] ?? rule}</span>
                        <span className="font-medium text-ink tabular-nums">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-surface ring-1 ring-line">
                  <h3 className="px-5 pt-5 text-sm font-semibold text-ink">Recent calls</h3>
                  <table className="mt-3 w-full text-left text-sm">
                    <thead className="text-xs text-muted">
                      <tr className="border-b border-line">
                        <th scope="col" className="px-5 py-2 font-medium">Customer</th>
                        <th scope="col" className="hidden px-2 py-2 font-medium sm:table-cell">Type</th>
                        <th scope="col" className="px-2 py-2 text-right font-medium">Amount</th>
                        <th scope="col" className="hidden px-2 py-2 text-right font-medium md:table-cell">Duration</th>
                        <th scope="col" className="px-5 py-2 text-right font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {calls.map((c) => (
                        <tr key={c.event_id}>
                          <td className="px-5 py-3">
                            <span className="font-medium text-ink">{c.customer_name}</span>
                            <span className="block text-xs text-muted sm:hidden">{failureTypeLabel[c.failure_type]}</span>
                          </td>
                          <td className="hidden px-2 py-3 text-ink-2 sm:table-cell">{failureTypeLabel[c.failure_type]}</td>
                          <td className="px-2 py-3 text-right text-ink tabular-nums">{formatInr(c.amount_inr)}</td>
                          <td className="hidden px-2 py-3 text-right text-ink-2 tabular-nums md:table-cell">{formatDuration(c.duration_s)}</td>
                          <td className="px-5 py-3 text-right">
                            <ResultBadge result={c.result} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="border-t border-line px-5 py-3 text-xs text-muted">
                    In the product, each row opens the event: decision, stopping rules, recording and full transcript.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
