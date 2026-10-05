import type { Integration } from "@/types";
import { AvailabilityBadge } from "./ui";

export function IntegrationCard({ item }: { item: Integration }) {
  return (
    <article className="flex h-full flex-col rounded-xl bg-surface p-5 ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-lg bg-paper text-sm font-semibold text-ink-2 ring-1 ring-line"
          >
            {item.name.charAt(0)}
          </span>
          <h4 className="text-sm font-semibold text-ink">{item.name}</h4>
        </div>
        <AvailabilityBadge value={item.availability} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
    </article>
  );
}
