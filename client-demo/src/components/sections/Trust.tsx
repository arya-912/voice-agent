import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

/**
 * Social proof is intentionally PLACEHOLDER. Replace only with real,
 * permissioned client logos, quotes and measured results.
 */
const logoSlots = 5;
const testimonialSlots = 2;
const metricSlots = ["Recovery rate on pilot", "Revenue recovered", "Calls handled"];

const reliability = [
  { icon: "list", title: "Append-only by design", body: "A database trigger rejects any UPDATE or DELETE on the audit log. History can't be rewritten." },
  { icon: "lock", title: "No sensitive payment data", body: "The agent never collects card numbers, CVV, OTP or UPI PIN. Payment happens on a secure link." },
  { icon: "shieldCheck", title: "Consent before calling", body: "Every batch needs an attestation that the contacts are the merchant's own customers." },
  { icon: "server", title: "Your infrastructure", body: "Runs on your Postgres (local or AWS RDS with TLS verification) and your own SIP trunk." },
] as const;

function Placeholder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-xl border border-dashed border-line-strong bg-paper text-center text-xs font-medium text-muted ${className}`}>
      {children}
    </div>
  );
}

export function Trust() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="trust-title"
          eyebrow="Trust"
          title="Built to be safe to put in front of your customers."
        />

        <Reveal className="mt-12">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reliability.map((r) => (
              <li key={r.title} className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
                <Icon name={r.icon} className="size-6 text-brand" />
                <h3 className="mt-4 text-sm font-semibold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-14">
          <div className="rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">Client proof</h3>
              <span className="text-xs text-muted">Placeholders. Add real logos, quotes and results once approved.</span>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-label="Client logo placeholders">
              {Array.from({ length: logoSlots }, (_, i) => (
                <li key={i}>
                  <Placeholder className="h-14">Client logo</Placeholder>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3 lg:grid-cols-[2fr_1fr]">
              <ul className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: testimonialSlots }, (_, i) => (
                  <li key={i}>
                    <Placeholder className="h-36 flex-col gap-1 px-6">
                      <span>Client testimonial</span>
                      <span className="font-normal">Name, role, company</span>
                    </Placeholder>
                  </li>
                ))}
              </ul>
              <ul className="grid gap-3">
                {metricSlots.map((m) => (
                  <li key={m}>
                    <Placeholder className="h-[2.75rem] justify-between px-4">
                      <span className="font-normal">{m}</span>
                      <span>Metric</span>
                    </Placeholder>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
