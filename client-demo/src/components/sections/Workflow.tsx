import { agentWorkflow } from "@/data/voiceAgents";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container } from "../ui";

/** "What can your AI agent do?" A real lead workflow as a visual sequence. */
export function Workflow() {
  return (
    <section id="workflow" aria-labelledby="workflow-title" className="bg-console py-20 text-console-text sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-live">A typical workflow</p>
          <h2 id="workflow-title" className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            Automatically follow up with every new lead.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-console-muted sm:text-lg">
            Here&apos;s what happens when a lead comes in, without anyone on your team picking up the phone.
          </p>
        </div>

        <Reveal className="mt-12">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-0">
            {agentWorkflow.map((s, i) => {
              const last = i === agentWorkflow.length - 1;
              return (
                <li key={s.title} className="relative flex lg:flex-col">
                  <div
                    className={`flex flex-1 flex-col rounded-2xl p-5 ring-1 lg:mx-1.5 ${
                      last ? "bg-live/10 ring-live/40" : "bg-console-2 ring-console-line"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`flex size-9 items-center justify-center rounded-xl ${last ? "bg-live text-console" : "bg-console-3 text-live"}`}>
                        <Icon name={s.icon} className="size-[18px]" />
                      </span>
                      <span className="font-mono text-xs text-console-muted">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-white">{s.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-console-muted">{s.description}</p>
                  </div>
                  {!last && (
                    <span aria-hidden className="absolute top-1/2 -right-1.5 z-10 hidden -translate-y-1/2 text-console-muted lg:block">
                      <Icon name="arrowRight" className="size-3.5" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </Reveal>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-console-muted">
          Each step is configured for your business: which leads to call, what to ask, what counts as qualified, which system to update, and when a person should take over.
        </p>
      </Container>
    </section>
  );
}
