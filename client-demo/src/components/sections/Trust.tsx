import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

const reliability = [
  { icon: "list", title: "Append-only by design", body: "A database trigger rejects any UPDATE or DELETE on the audit log. History can't be rewritten." },
  { icon: "lock", title: "No sensitive payment data", body: "The agent never collects card numbers, CVV, OTP or UPI PIN. Payment happens on a secure link." },
  { icon: "shieldCheck", title: "Consent before calling", body: "Every batch needs an attestation that the contacts are the merchant's own customers." },
  { icon: "server", title: "Your infrastructure", body: "Runs on your Postgres (local or AWS RDS with TLS verification) and your own SIP trunk." },
] as const;

export function Trust() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="trust-title"
          eyebrow="Trust"
          title="Built to be safe to put in front of customers."
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

      </Container>
    </section>
  );
}
