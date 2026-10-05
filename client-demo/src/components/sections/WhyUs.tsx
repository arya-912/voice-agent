import { safeguards, whyUs } from "@/data/howItWorks";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function WhyUs() {
  return (
    <section id="why-us" aria-labelledby="why-us-title" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="why-us-title"
          eyebrow="Why businesses work with us"
          title="Automation that fits how you already work."
        />
        <Reveal className="mt-12">
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((r) => (
              <li key={r.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand ring-1 ring-brand/15">
                  <Icon name={r.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-16 rounded-2xl bg-paper p-6 ring-1 ring-line sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-sm font-semibold tracking-wide text-brand">Responsible by design</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Safeguards we build in</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                These are running in our payment-recovery agent today, enforced in code rather than only in the prompt. For your agent, we configure the equivalent rules for your business and your customers.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {safeguards.map((g) => (
                <li key={g.title} className="flex gap-3">
                  <Icon name={g.icon} className="mt-0.5 size-5 shrink-0 text-brand" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{g.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{g.description}</p>
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
