import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Discuss your use case",
  description: "Tell us what your team is doing manually, and we'll show you where an AI voice agent can help.",
};

const expect = [
  { icon: "message", text: "A short call about what your team does by phone today." },
  { icon: "target", text: "We pick the call type where an agent would save the most time." },
  { icon: "phone", text: "We show you a sample conversation and the actions it would take." },
  { icon: "file", text: "You get a clear proposal: scope, integrations and timeline." },
] as const;

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand">Book a consultation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
            Tell us what your team is doing manually.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            We&apos;ll show you where AI can help. For founders, business owners and operations teams who want to automate calls, follow-ups and customer conversations, or need a chatbot, website or custom software alongside.
          </p>
          <h2 className="mt-10 text-sm font-semibold text-ink">What happens next</h2>
          <ol className="mt-4 space-y-4">
            {expect.map((e, i) => (
              <li key={e.text} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand ring-1 ring-brand/15">
                  <Icon name={e.icon} className="size-4" />
                </span>
                <p className="pt-1 text-sm text-ink-2">
                  <span className="sr-only">Step {i + 1}: </span>
                  {e.text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-sm text-muted">
            Want to see it first?{" "}
            <Link href="/demo" className="font-medium text-brand underline-offset-4 hover:underline">
              Try the interactive demo
            </Link>
            .
          </p>
        </div>
        <ContactForm />
      </div>
    </Container>
  );
}
