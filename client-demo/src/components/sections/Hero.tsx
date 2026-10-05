import { HeroCallCard } from "../HeroCallCard";
import { Icon } from "../Icon";
import { ButtonLink, Container } from "../ui";

const proof = [
  { icon: "phoneOutgoing", text: "Calls new leads within minutes" },
  { icon: "target", text: "Qualifies, books and follows up" },
  { icon: "headset", text: "Hands over to your team when needed" },
] as const;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_70%_20%,var(--color-brand-soft),transparent_70%)]"
      />
      <Container className="relative grid items-center gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-2 ring-1 ring-line">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            AI voice agents for businesses
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-ink sm:text-5xl lg:text-[3.5rem]"
          >
            AI voice agents that talk to your customers.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            Automate outbound calls, lead follow-ups, customer conversations and repetitive calling work with AI voice agents built around your business. They call, understand the reply, and take the next step.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demo" size="lg" icon>
              Try the AI demo
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Book a consultation
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-ink-2 sm:grid-cols-3 sm:gap-4">
            {proof.map((p) => (
              <li key={p.text} className="flex items-start gap-2">
                <Icon name={p.icon} className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <HeroCallCard />
        </div>
      </Container>
    </section>
  );
}
