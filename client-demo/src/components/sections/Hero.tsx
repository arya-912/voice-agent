import { HeroCallCard } from "../HeroCallCard";
import { Icon } from "../Icon";
import { ButtonLink, Container } from "../ui";

const proof = [
  { icon: "languages", text: "Natural Hindi–English code-switching" },
  { icon: "shieldCheck", text: "Guardrails enforced in code, not just prompts" },
  { icon: "list", text: "Every decision on an append-only audit trail" },
] as const;

export function Hero() {
  return (
    <section id="product" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_70%_20%,var(--color-brand-soft),transparent_70%)]"
      />
      <Container className="relative grid items-center gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-2 ring-1 ring-line">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            Voice agents for payment recovery
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-ink sm:text-5xl lg:text-[3.5rem]"
          >
            Recover failed payments with a voice your customers trust.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            Razorcovery calls customers whose payment failed, explains what happened in natural Hinglish, and sends a secure retry link. It never asks for card details and stops the moment someone says no.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demo" size="lg" icon>
              See the demo
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Talk to us
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
