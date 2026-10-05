import Link from "next/link";
import type { AgentProfile } from "@/types";
import { Icon } from "./Icon";
import { AvailabilityBadge, IconTile } from "./ui";

export function AgentCard({ agent }: { agent: AgentProfile }) {
  const live = agent.availability === "live";
  return (
    <article className="flex h-full flex-col rounded-2xl bg-surface shadow-card ring-1 ring-line transition-shadow hover:shadow-lift">
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between gap-3">
          <IconTile name={agent.icon} tone={live ? "brand" : "muted"} />
          <AvailabilityBadge value={agent.availability} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">{agent.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{agent.purpose}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key capabilities">
          {agent.capabilities.map((c) => (
            <li key={c} className="rounded-md bg-paper px-2 py-1 text-xs text-ink-2 ring-1 ring-line">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="m-6 flex-1 rounded-xl bg-paper p-4 ring-1 ring-line">
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Example conversation</p>
        <ol className="mt-3 space-y-2.5">
          {agent.sample.map((l, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span
                className={`mt-0.5 w-[4.25rem] shrink-0 text-[11px] font-semibold uppercase ${l.speaker === "agent" ? "text-brand" : "text-ink-2"}`}
              >
                {l.speaker === "agent" ? "Agent" : "Customer"}
              </span>
              <span className="min-w-0">
                <span className="text-ink">{l.text}</span>
                {l.translation && <span className="mt-0.5 block text-xs text-muted">{l.translation}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted">{agent.routing}</p>
        {agent.demoScenario ? (
          <Link
            href={`/demo?scenario=${agent.demoScenario}`}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong"
          >
            Try demo
            <span className="sr-only"> of the {agent.name}</span>
            <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span className="shrink-0 text-xs font-medium text-muted">Concept, not built yet</span>
        )}
      </div>
    </article>
  );
}
