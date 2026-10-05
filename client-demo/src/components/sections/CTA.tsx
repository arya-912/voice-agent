import { ButtonLink, Container } from "../ui";

export function CTA() {
  return (
    <section aria-labelledby="cta-title" className="pb-20 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgb(255_255_255/0.14),transparent_70%)]"
          />
          <h2 id="cta-title" className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            See what your failed payments could become.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
            Share a sample of last month&apos;s failed payments and we&apos;ll walk you through how each one would be routed, called and audited.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" variant="inverse" size="lg" icon>
              Talk to our team
            </ButtonLink>
            <ButtonLink href="/demo" size="lg" className="ring-1 ring-white/20">
              Try the demo call
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
