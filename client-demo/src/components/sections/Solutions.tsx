import { primaryService, secondaryServices } from "@/data/solutions";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { ButtonLink, Container, SectionHeading } from "../ui";

export function Solutions() {
  const p = primaryService;
  return (
    <section id="solutions" aria-labelledby="solutions-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="solutions-title"
          eyebrow="Solutions"
          title="Voice agents first. Everything around them, too."
          description="Our main focus is AI voice agents. When a project needs more, we also build the chatbots, websites, software and dashboards that work alongside them."
        />

        <Reveal className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <article className="relative flex flex-col overflow-hidden rounded-3xl bg-brand p-7 text-white shadow-lift sm:p-9 dark:bg-brand-soft dark:ring-1 dark:ring-brand/30">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_100%_0%,rgb(255_255_255/0.14),transparent_70%)]"
            />
            <div className="relative flex items-center justify-between gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <Icon name={p.icon} className="size-6" />
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">Our main offering</span>
            </div>
            <h3 className="relative mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h3>
            <p className="relative mt-3 max-w-xl text-base leading-relaxed text-white/85">{p.description}</p>
            <ul className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2 text-sm">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} />
                  {pt}
                </li>
              ))}
            </ul>
            <div className="relative mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
              <ButtonLink href="/demo" variant="inverse" icon>
                Try the AI demo
              </ButtonLink>
              <ButtonLink href="/contact" className="ring-1 ring-white/25">
                Discuss your use case
              </ButtonLink>
            </div>
          </article>

          <div>
            <h3 className="text-sm font-semibold text-ink-2">Also from our team</h3>
            <ul className="mt-3 grid gap-3">
              {secondaryServices.map((s) => (
                <li key={s.title} className="flex gap-4 rounded-2xl bg-surface p-4 ring-1 ring-line">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper text-ink-2 ring-1 ring-line">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-ink">{s.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
