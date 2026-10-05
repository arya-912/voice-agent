import { integrations } from "@/data/integrations";
import type { Integration } from "@/types";
import { IntegrationCard } from "../IntegrationCard";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

const ORDER: Integration["category"][] = ["Voice & AI", "Telephony", "Data in", "Data out", "Payments"];

export function Integrations() {
  const groups = ORDER.map((cat) => ({
    cat,
    items: integrations.filter((i) => i.category === cat),
  })).filter((g) => g.items.length);

  return (
    <section id="integrations" aria-labelledby="integrations-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="integrations-title"
          eyebrow="Integrations"
          title="Runs on a proven real-time voice stack."
          description="The stack behind the payment-recovery agent. Only integrations it actually uses are listed, and anything not yet verified end to end is labelled."
        />
        <Reveal className="mt-12 space-y-8">
          {groups.map((g) => (
            <div key={g.cat} className="grid gap-4 lg:grid-cols-[180px_1fr]">
              <h3 className="pt-1 text-sm font-semibold text-ink-2">{g.cat}</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.items.map((i) => (
                  <li key={i.name}>
                    <IntegrationCard item={i} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
