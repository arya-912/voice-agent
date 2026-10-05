import { capabilities } from "@/data/capabilities";
import { FeatureCard } from "../FeatureCard";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function Capabilities() {
  const live = capabilities.filter((c) => c.availability === "live");
  const next = capabilities.filter((c) => c.availability !== "live");
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="capabilities-title"
          eyebrow="What we built"
          title="Everything a recovery call needs, built in."
          description="Each live capability below runs in the Razorcovery implementation today, and the card names the module it lives in. Work in progress is labelled as such."
        />
        <Reveal className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <li key={c.title}>
                <FeatureCard item={c} />
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="mt-10">
          <h3 className="text-sm font-semibold text-ink-2">In progress and on the roadmap</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {next.map((c) => (
              <li key={c.title}>
                <FeatureCard item={c} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
