import { availabilityHelp } from "@/data/site";
import { useCases } from "@/data/useCases";
import type { Availability } from "@/types";
import { Reveal } from "../Reveal";
import { UseCaseCard } from "../UseCaseCard";
import { AvailabilityBadge, ButtonLink, Container, SectionHeading } from "../ui";

const legend: Availability[] = ["live", "preview", "custom", "roadmap"];

/** The primary product: what a voice agent can do, with honest availability labels. */
export function VoiceAgents() {
  return (
    <section id="voice-agents" aria-labelledby="voice-agents-title" className="border-y border-line bg-surface py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="voice-agents-title"
            eyebrow="AI voice agents"
            title="What your AI voice agent can do."
            description="Your agent can call customers, understand their responses and take the next action. We build each one around your workflow, so it asks your questions and follows your rules."
          />
          <ButtonLink href="/demo" variant="secondary" icon className="self-start lg:self-auto">
            Hear it on a demo call
          </ButtonLink>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 rounded-xl bg-paper px-4 py-3 text-xs text-muted ring-1 ring-line">
          {legend.map((a) => (
            <div key={a} className="flex items-center gap-2">
              <dt><AvailabilityBadge value={a} /></dt>
              <dd>{availabilityHelp[a]}</dd>
            </div>
          ))}
        </dl>

        <Reveal className="mt-8">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
