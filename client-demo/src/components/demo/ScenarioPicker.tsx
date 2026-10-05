"use client";

import { failureTypeLabel, formatInr } from "@/lib/format";
import type { DemoScenario } from "@/types";

export function ScenarioPicker({
  scenarios,
  value,
  onChange,
  disabled,
}: {
  scenarios: DemoScenario[];
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="disabled:opacity-60">
      <legend className="text-sm font-semibold text-ink">Choose a scenario</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {scenarios.map((s) => {
          const checked = s.id === value;
          return (
            <label
              key={s.id}
              className={`relative flex cursor-pointer flex-col rounded-xl p-4 ring-1 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                checked ? "bg-brand-tint ring-brand" : "bg-surface ring-line hover:ring-line-strong"
              } ${disabled ? "cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name="scenario"
                value={s.id}
                checked={checked}
                onChange={() => onChange(s.id)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{s.title}</span>
                <span
                  aria-hidden
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full ring-1 ${checked ? "bg-brand ring-brand" : "ring-line-strong"}`}
                >
                  {checked && <span className="size-1.5 rounded-full bg-white" />}
                </span>
              </span>
              <span className="mt-1 text-xs text-muted">
                {failureTypeLabel[s.failureType]} · {formatInr(s.amountInr)} · {s.customerName}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
