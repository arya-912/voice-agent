import { caseStudy } from "@/data/caseStudy";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { ButtonLink, Container } from "../ui";

/** Razorcovery as the featured example of what we build. */
export function CaseStudy() {
  return (
    <section id="case-study" aria-labelledby="case-title" className="bg-console py-20 text-console-text sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-live">Built for real business workflows</p>
          <h2 id="case-title" className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            Featured implementation: {caseStudy.name}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-console-muted sm:text-lg">
            A {caseStudy.label.toLowerCase()} we built that places real phone calls. It&apos;s one example of the systems we build, and the same engine powers every agent on this site.
          </p>
        </div>

        <Reveal className="mt-12 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-console-2 p-6 ring-1 ring-console-line">
            <h3 className="text-xs font-semibold tracking-wide text-console-muted uppercase">The problem</h3>
            <p className="mt-3 text-base leading-relaxed text-console-text">{caseStudy.problem}</p>
          </div>
          <div className="rounded-2xl bg-console-2 p-6 ring-1 ring-console-line">
            <h3 className="text-xs font-semibold tracking-wide text-console-muted uppercase">The AI solution</h3>
            <p className="mt-3 text-base leading-relaxed text-console-text">{caseStudy.solution}</p>
          </div>

          <div className="rounded-2xl bg-console-2 p-6 ring-1 ring-console-line lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-wide text-console-muted uppercase">The workflow</h3>
            <ol className="mt-4 flex flex-wrap items-center gap-2">
              {caseStudy.flow.map((f, i) => (
                <li key={f.label} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-console-3 px-3.5 py-2 text-sm ring-1 ring-console-line">
                    <Icon name={f.icon} className="size-4 text-live" />
                    {f.label}
                  </span>
                  {i < caseStudy.flow.length - 1 && <Icon name="arrowRight" className="size-4 text-console-muted" />}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-console-2 p-6 ring-1 ring-console-line lg:col-span-2">
            <h3 className="text-xs font-semibold tracking-wide text-console-muted uppercase">What it demonstrates</h3>
            <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {caseStudy.demonstrates.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-live" strokeWidth={2.25} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/work/razorcovery" variant="inverse" icon>
            Read the case study
          </ButtonLink>
          <ButtonLink href="/demo?scenario=payment_retry" className="ring-1 ring-white/20">
            Try the payment follow-up call
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
