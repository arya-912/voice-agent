import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AgentShowcase } from "@/components/sections/AgentShowcase";
import { AnalyticsPreview } from "@/components/sections/AnalyticsPreview";
import { Capabilities } from "@/components/sections/Capabilities";
import { CTA } from "@/components/sections/CTA";
import { Integrations } from "@/components/sections/Integrations";
import { RecoveryWorkflow } from "@/components/sections/RecoveryWorkflow";
import { Trust } from "@/components/sections/Trust";
import { ButtonLink, Container } from "@/components/ui";
import { caseStudy } from "@/data/caseStudy";

export const metadata: Metadata = {
  title: `Case study: ${caseStudy.name}`,
  description: "How we built a payment-recovery AI voice agent that places real calls, follows business rules and keeps an audit trail.",
};

export default function RazorcoveryCaseStudy() {
  return (
    <>
      <section aria-labelledby="cs-title" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_60%_at_70%_10%,var(--color-brand-soft),transparent_70%)]"
        />
        <Container className="relative py-12 sm:py-16 lg:py-20">
          <Link href="/#case-study" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <Icon name="arrowRight" className="size-4 rotate-180" />
            Back to home
          </Link>
          <p className="mt-6 text-sm font-semibold tracking-wide text-brand">Case study · {caseStudy.label}</p>
          <h1 id="cs-title" className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
            {caseStudy.name}: an AI voice agent that recovers failed payments.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            One example of what we build. The agent calls customers whose payment failed, explains what happened in natural Hinglish and, with consent, sends a secure retry link. Below is how it works, what&apos;s live, and what&apos;s still in progress.
          </p>
          <div className="mt-8 grid max-w-4xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
              <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">The problem</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{caseStudy.problem}</p>
            </div>
            <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
              <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">The solution</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{caseStudy.solution}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/demo?scenario=payment_retry" size="lg" icon>
              Try the payment follow-up call
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Build something similar
            </ButtonLink>
          </div>
        </Container>
      </section>
      <Capabilities />
      <AgentShowcase />
      <RecoveryWorkflow />
      <Integrations />
      <AnalyticsPreview />
      <Trust />
      <CTA />
    </>
  );
}
