import { steps } from "@/data/howItWorks";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          title="A custom agent for your business, not a one-size-fits-all chatbot."
          description="We start from what your team does manually today and build the agent around it."
        />
        <Reveal className="mt-12">
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex flex-col rounded-2xl bg-paper p-6 ring-1 ring-line">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand ring-1 ring-brand/15">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-2">{s.detail}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
