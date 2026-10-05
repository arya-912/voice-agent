export interface StatItem {
  label: string;
  value: string;
  hint?: string;
}

/** Stat tiles: hero number + one line of context. */
export function Stats({ items, dark = false }: { items: StatItem[]; dark?: boolean }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className={`flex flex-col gap-1 p-4 sm:p-5 ${dark ? "bg-console-2" : "bg-surface"}`}>
          <dt className="text-xs font-medium text-muted">{s.label}</dt>
          <dd className="order-first text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-[1.75rem]">
            {s.value}
          </dd>
          {s.hint && <dd className="text-xs text-muted">{s.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
