"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { industryExamples } from "@/data/industries";
import { Icon } from "../Icon";
import { ButtonLink, Container, SectionHeading } from "../ui";

/** Tabbed, concrete example calls per industry. Keyboard: arrow keys move between tabs. */
export function IndustryExamples() {
  const [active, setActive] = useState(0);
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const ex = industryExamples[active];

  function onKey(e: React.KeyboardEvent) {
    const n = industryExamples.length;
    const next =
      e.key === "ArrowRight" ? (active + 1) % n :
      e.key === "ArrowLeft" ? (active - 1 + n) % n :
      e.key === "Home" ? 0 :
      e.key === "End" ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="examples" aria-labelledby="examples-title" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="examples-title"
          eyebrow="See it in your industry"
          title="What the call actually sounds like."
          description="A few examples of how an agent opens the call, what it asks and what it does next. Each business gets its own script."
        />

        <div role="tablist" aria-label="Industry examples" className="mt-10 flex gap-2 overflow-x-auto pb-1" onKeyDown={onKey}>
          {industryExamples.map((e, i) => {
            const selected = i === active;
            return (
              <button
                key={e.industry}
                ref={(el) => { tabs.current[i] = el; }}
                id={`${uid}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors ${
                  selected ? "bg-ink text-paper ring-ink" : "bg-paper text-ink-2 ring-line hover:text-ink hover:ring-line-strong"
                }`}
              >
                <Icon name={e.icon} className="size-4" />
                {e.industry}
              </button>
            );
          })}
        </div>

        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${active}`}
          className="mt-6 grid gap-6 rounded-2xl bg-paper p-5 ring-1 ring-line sm:p-8 lg:grid-cols-[1.3fr_1fr]"
        >
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">The agent opens with</p>
            <figure key={active} className="animate-fade-up mt-3 rounded-2xl rounded-tl-sm bg-console p-5 text-console-text ring-1 ring-console-line">
              <div className="flex items-center gap-2 text-xs text-console-muted">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
                  <Icon name="wave" className="size-3.5" strokeWidth={2.25} />
                </span>
                AI agent for {ex.business}
              </div>
              <blockquote className="mt-3 text-base leading-relaxed">“{ex.opener}”</blockquote>
            </figure>
            {ex.note && (
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <Icon name="shield" className="mt-px size-4 shrink-0 text-brand" />
                {ex.note}
              </p>
            )}
            <p className="mt-4 text-xs text-muted">{ex.business} is a fictional business used for illustration.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Then asks about</p>
              <ul className="mt-3 space-y-2">
                {ex.asks.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-ink-2">
                    <Icon name="message" className="mt-0.5 size-4 shrink-0 text-brand" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">And takes action</p>
              <ul className="mt-3 space-y-2">
                {ex.actions.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-ink-2">
                    <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.25} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              {ex.demoScenario ? (
                <ButtonLink href={`/demo?scenario=${ex.demoScenario}`} icon>
                  Try this call yourself
                </ButtonLink>
              ) : (
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong">
                  Discuss this use case
                  <Icon name="arrowRight" className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
