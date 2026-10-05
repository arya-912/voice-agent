import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Talk to us",
  description: "Request a walkthrough of Razorcovery's payment-recovery voice agents.",
};

const expect = [
  { icon: "file", text: "Share a sample of failed payments. Anonymised is fine." },
  { icon: "route", text: "We show how each row would be routed: call, SMS or link." },
  { icon: "phone", text: "We place a live test call to a number you control." },
  { icon: "chart", text: "You get the transcript, audit trail and cost per recovery." },
] as const;

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand">Talk to us</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
            See it work on your own failed payments.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Tell us a little about your payments, and we&apos;ll set up a walkthrough using your real failure types and order values.
          </p>
          <h2 className="mt-10 text-sm font-semibold text-ink">What a walkthrough looks like</h2>
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
