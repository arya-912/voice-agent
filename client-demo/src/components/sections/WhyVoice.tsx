import { whyVoice } from "@/data/voiceAgents";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container, SectionHeading } from "../ui";

export function WhyVoice() {
  return (
    <section id="why-voice" aria-labelledby="why-voice-title" className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          id="why-voice-title"
          eyebrow="Why AI voice agents?"
          title="Your customers answer calls. Your team can't make all of them."
          description="Most businesses lose leads and revenue to slow or forgotten follow-up, not to a lack of interest. A voice agent makes the call your team didn't have time to."
        />
        <Reveal className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyVoice.map((r) => (
              <li key={r.title} className="rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line">
                <Icon name={r.icon} className="size-6 text-brand" />
                <h3 className="mt-4 text-base font-semibold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.description}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
