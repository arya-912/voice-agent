import { ButtonLink, Container } from "../ui";

export function CTA() {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 dark:bg-brand-soft dark:ring-1 dark:ring-brand/30 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgb(255_255_255/0.14),transparent_70%)]"
          />
          <h2 id="cta-title" className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            Tell us what your team is doing manually.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
            We&apos;ll show you where an AI voice agent can take over, and what the calls would sound like for your business.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" variant="inverse" size="lg" icon>
              Book a consultation
            </ButtonLink>
            <ButtonLink href="/demo" size="lg" className="ring-1 ring-white/20">
              Try the AI demo
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
