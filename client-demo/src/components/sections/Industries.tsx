import Link from "next/link";
import { industries } from "@/data/industries";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function Industries() {
  return (
    <section id="industries" aria-labelledby="industries-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="industries-title"
          eyebrow="Industries we serve"
          title="One voice-agent engine, adapted to your industry."
          description="The conversation, questions and actions change for each business. The engine underneath, with calling, understanding, actions and safeguards, stays the same. These are examples, not limits."
        />
        <Reveal className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industries.map((ind) => (
              <li key={ind.id}>
                <article className="group flex h-full flex-col rounded-2xl bg-surface p-5 shadow-card ring-1 ring-line transition-shadow hover:shadow-lift">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                      <Icon name={ind.icon} className="size-5" />
                    </span>
                    <h3 className="text-base leading-snug font-semibold text-ink">{ind.name}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{ind.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`What the agent does for ${ind.name.toLowerCase()}`}>
                    {ind.tasks.map((t) => (
                      <li key={t} className="rounded-md bg-paper px-2 py-1 text-xs text-ink-2 ring-1 ring-line">
                        {t}
                      </li>
                    ))}
                  </ul>
                  {ind.note && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
                      <Icon name="shield" className="mt-px size-3.5 shrink-0" />
                      {ind.note}
                    </p>
                  )}
                  <div className="mt-auto pt-4">
                    {ind.demoScenario ? (
                      <Link
                        href={`/demo?scenario=${ind.demoScenario}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-strong"
                      >
                        Try a demo call
                        <span className="sr-only"> for {ind.name}</span>
                        <Icon name="arrowRight" className="size-4" />
                      </Link>
                    ) : (
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
                      >
                        Discuss your use case
                        <span className="sr-only"> for {ind.name}</span>
                        <Icon name="arrowRight" className="size-4" />
                      </Link>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Reveal>
        <p className="mt-8 text-sm text-muted">
          Don&apos;t see your industry?{" "}
          <Link href="/contact" className="font-medium text-brand underline-offset-4 hover:underline">
            Tell us what your team calls about
          </Link>
          . If it&apos;s repetitive, it&apos;s probably a good fit.
        </p>
      </Container>
    </section>
  );
}
