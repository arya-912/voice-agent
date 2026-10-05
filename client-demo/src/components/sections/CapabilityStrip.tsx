import { capabilityStrip } from "@/data/voiceAgents";
import { Icon } from "../Icon";
import { Container } from "../ui";

/** Thin strip under the hero: what every agent does, in plain words. No fake logos. */
export function CapabilityStrip() {
  return (
    <section aria-label="What every agent does" className="border-y border-line bg-surface">
      <Container>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 text-sm text-ink-2 sm:grid-cols-3 lg:grid-cols-5">
          {capabilityStrip.map((c) => (
            <li key={c.text} className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand ring-1 ring-brand/15">
                <Icon name={c.icon} className="size-4" />
              </span>
              {c.text}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
