import type { Capability } from "@/types";
import { AvailabilityBadge, IconTile } from "./ui";

export function FeatureCard({ item }: { item: Capability }) {
  const live = item.availability === "live";
  return (
    <article
      className={`group flex h-full flex-col rounded-2xl p-6 ring-1 transition-shadow ${
        live
          ? "bg-surface shadow-card ring-line hover:shadow-lift"
          : "bg-paper ring-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile name={item.icon} tone={live ? "brand" : "muted"} />
        <AvailabilityBadge value={item.availability} />
      </div>
      <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.description}</p>
      {item.source && (
        <p className="mt-4 font-mono text-[11px] text-muted/80">{item.source}</p>
      )}
    </article>
  );
}
