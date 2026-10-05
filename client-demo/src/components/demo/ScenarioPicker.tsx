"use client";

import type { DemoScenario, ScenarioGroup } from "@/types";
import { Icon } from "../Icon";

const groups: { id: ScenarioGroup; label: string }[] = [
  { id: "business", label: "Business scenarios" },
  { id: "recovery", label: "From our payment-recovery agent" },
];

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
      <legend className="text-sm font-semibold text-ink">Choose a business scenario</legend>
      {groups.map((g) => {
        const items = scenarios.filter((s) => s.group === g.id);
        if (!items.length) return null;
        return (
          <div key={g.id} className="mt-3">
            <p className="text-xs font-medium text-muted">{g.label}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {items.map((s) => {
                const checked = s.id === value;
                return (
                  <label
                    key={s.id}
                    className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ring-1 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
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
                    <span
                      aria-hidden
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${checked ? "bg-brand text-white ring-brand" : "bg-paper text-ink-2 ring-line"}`}
                    >
                      <Icon name={s.icon} className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{s.title}</span>
                      <span className="block truncate text-xs text-muted">
                        {s.business} · {s.language}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
