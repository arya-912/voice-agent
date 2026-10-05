"use client";

import type { CallResult, DemoScenario, TranscriptEntry } from "@/types";
import { Icon } from "../Icon";
import { ResultBadge } from "../ResultBadge";

const headline: Record<CallResult, string> = {
  recovered: "Consent captured and retry link sent.",
  link_sent_no_commit: "Link sent without a verbal commitment.",
  declined: "Soft no. The customer can be contacted again later.",
  refused: "Refusal honoured. All channels are now blocked for this customer.",
  wrong_number: "Wrong person. The number is flagged on the event.",
  no_answer: "No conversation took place.",
  failed: "The call failed for a technical reason.",
  appointment_booked: "Next step booked. The team has the details and the time.",
  info_sent: "Details sent. A follow-up is scheduled.",
  callback_scheduled: "The customer was busy, so a callback is scheduled within calling hours.",
  handed_off: "Handed over to a person, with everything the customer said attached.",
};

/** After the call: outcome, captured details and the log rows a real system would write. */
export function OutcomePanel({
  result,
  scenario,
  collected,
  transcript,
  onRestart,
  onDownload,
}: {
  result: CallResult | null;
  scenario: DemoScenario;
  collected: Record<string, string>;
  transcript: TranscriptEntry[];
  onRestart: () => void;
  onDownload: () => void;
}) {
  const tools = transcript.filter((t) => t.tool).map((t) => t.tool!);
  const recovery = scenario.group === "recovery";
  const audit = [
    recovery
      ? { type: "event_ingested", text: `${scenario.failureType} · ₹${(scenario.amountInr ?? 0).toLocaleString("en-IN")}` }
      : { type: "lead_received", text: scenario.trigger },
    { type: "decision", text: scenario.routingReason ?? `goal: ${scenario.goal}` },
    { type: "action", text: "voice call placed · attempt 1 of 2" },
    ...(result === "refused" ? [{ type: "stopping_rule_triggered", text: "explicit_refusal · blocks all channels" }] : []),
    { type: "outcome", text: `${result ?? "ended_by_caller"} · transcript stored (${transcript.filter((t) => t.speaker !== "system").length} turns)` },
  ];

  return (
    <div className="animate-fade-up rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-semibold text-ink">Call outcome</h3>
        {result ? <ResultBadge result={result} /> : <span className="text-xs font-medium text-muted">Ended by you</span>}
      </div>
      <p className="mt-2 text-sm text-ink-2">{result ? headline[result] : "You hung up before the agent finished. In a real deployment the partial transcript is still logged."}</p>

      {Object.keys(collected).length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Details the agent captured</p>
          <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {Object.entries(collected).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {tools.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Tools the agent called</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {tools.map((t, i) => (
              <li key={i} className="rounded-md bg-paper px-2 py-1 font-mono text-xs text-ink-2 ring-1 ring-line">
                {t}()
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">What a real deployment would log</p>
        <ol className="mt-3 space-y-0">
          {audit.map((a, i) => (
            <li key={a.type} className="relative flex gap-3 pb-3 last:pb-0">
              {i < audit.length - 1 && <span aria-hidden className="absolute top-4 left-[5px] h-full w-px bg-line" />}
              <span aria-hidden className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ring-2 ring-surface ${a.type === "stopping_rule_triggered" ? "bg-bad" : "bg-brand"}`} />
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium text-ink">{a.type}</p>
                <p className="text-xs break-words text-muted">{a.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">Shown for illustration. This simulation doesn&apos;t write to a database or call our AI backend.</p>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper hover:bg-ink-2"
        >
          <Icon name="restart" className="size-4" />
          Try another path
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-ink ring-1 ring-line-strong ring-inset hover:bg-paper"
        >
          <Icon name="file" className="size-4" />
          Download transcript (JSON)
        </button>
      </div>
    </div>
  );
}
