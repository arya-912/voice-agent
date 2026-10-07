import type { UseCase } from "@/types";
import { Icon } from "./Icon";
import { AvailabilityBadge, IconTile } from "./ui";

export function UseCaseCard({ item }: { item: UseCase }) {
  const live = item.availability !== "roadmap";
  return (
    <article className={`flex h-full flex-col rounded-2xl bg-surface p-6 ring-1 ring-line ${live ? "shadow-card" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <IconTile name={item.icon} tone={live ? "brand" : "muted"} />
        <AvailabilityBadge value={item.availability} />
      </div>
      <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
      <ul className="mt-5 space-y-2 border-t border-line pt-4">
        {item.examples.map((e) => (
          <li key={e} className="flex items-start gap-2 text-sm text-ink-2">
            <Icon name="check" className={`mt-0.5 size-4 shrink-0 ${live ? "text-brand" : "text-slate-400"}`} />
            {e}
          </li>
        ))}
      </ul>
    </article>
  );
}
