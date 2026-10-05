import { agents } from "@/data/agents";
import { AgentCard } from "../AgentCard";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function AgentShowcase() {
  const live = agents.filter((a) => a.availability === "live");
  const concepts = agents.filter((a) => a.availability !== "live");
  return (
    <section id="agents" aria-labelledby="agents-title" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="agents-title"
          eyebrow="Agents"
          title="One agent for each way a payment fails."
          description="Each agent follows the same flow: confirm identity, explain, offer a link, then respect the answer. Only the context and routing rules change between them."
        />
        <Reveal className="mt-12">
          <ul className="grid gap-5 lg:grid-cols-3">
            {live.map((a) => (
              <li key={a.id}>
                <AgentCard agent={a} />
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="mt-12">
          <h3 className="text-sm font-semibold text-ink-2">Next on the same engine</h3>
          <ul className="mt-4 grid gap-5 md:grid-cols-2">
            {concepts.map((a) => (
              <li key={a.id}>
                <AgentCard agent={a} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
