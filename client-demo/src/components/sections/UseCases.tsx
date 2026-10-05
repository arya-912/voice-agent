import { useCases } from "@/data/useCases";
import { UseCaseCard } from "../UseCaseCard";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function UseCases() {
  return (
    <section id="use-cases" aria-labelledby="use-cases-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="use-cases-title"
          eyebrow="Use cases"
          title="Built for businesses that lose revenue at the payment step."
          description="The live use cases below all run on the three recovery flows. The roadmap items reuse the same guardrails and audit trail."
        />
        <Reveal className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <li key={u.title}>
                <UseCaseCard item={u} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
