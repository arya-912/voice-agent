import { guardrails, steps } from "@/data/howItWorks";
import { Icon } from "../Icon";
import { Reveal } from "../Reveal";
import { Container } from "../ui";

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="bg-console py-20 text-console-text sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-live">How it works</p>
          <h2 id="how-title" className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            From a sheet of failed payments to recovered revenue in four steps.
          </h2>
        </div>

        <Reveal className="mt-12">
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex flex-col rounded-2xl bg-console-2 p-6 ring-1 ring-console-line">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-console-3 text-live">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-console-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-console-text/80">{s.description}</p>
                <p className="mt-4 border-t border-console-line pt-4 text-xs leading-relaxed text-console-muted">{s.detail}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-16 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">Guardrails the model can&apos;t talk its way around</h3>
            <p className="mt-3 text-sm leading-relaxed text-console-muted">
              These rules are enforced by the decision layer and by the call&apos;s tools, not only by the prompt. Editing the agent&apos;s persona can&apos;t remove them.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {guardrails.map((g) => (
              <li key={g.title} className="flex gap-3">
                <Icon name={g.icon} className="mt-0.5 size-5 shrink-0 text-live" />
                <div>
                  <p className="text-sm font-semibold text-white">{g.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-console-muted">{g.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
