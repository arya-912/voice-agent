import Link from "next/link";
import { listScenarios } from "@/lib/api";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { VoiceVisualizer } from "../VoiceVisualizer";
import { ButtonLink, Container } from "../ui";

export function DemoPreview() {
  const scenarios = listScenarios();
  return (
    <section id="demo" aria-labelledby="demo-title" className="py-20 sm:py-24">
      <Container>
        <Reveal className="grid items-center gap-10 overflow-hidden rounded-3xl bg-console p-6 text-console-text ring-1 ring-console-line sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            <p className="text-sm font-semibold tracking-wide text-live">Interactive demo</p>
            <h2 id="demo-title" className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Be the customer. Talk to an AI agent.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-console-muted">
              Pick a business, start the call and reply however you like: answer the questions, push back, ask for a person, or say you&apos;re not interested. Watch what the agent captures and does.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/demo" variant="inverse" size="lg" icon>
                Start a demo call
              </ButtonLink>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-console-muted">
              <Icon name="alert" className="mt-px size-3.5 shrink-0" />
              A scripted simulation that runs in your browser. It doesn&apos;t place a phone call or use our production AI.
            </p>
          </div>
          <div>
            <VoiceVisualizer status="speaking" bars={32} className="h-14" />
            <ul className="mt-6 grid gap-2 sm:grid-cols-2" aria-label="Demo scenarios">
              {scenarios.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/demo?scenario=${s.id}`}
                    className="flex items-center gap-3 rounded-xl bg-console-2 px-3 py-2.5 text-sm ring-1 ring-console-line transition-colors hover:bg-console-3 hover:ring-live/40"
                  >
                    <Icon name={s.icon} className="size-4 shrink-0 text-live" />
                    <span className="min-w-0 truncate">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
