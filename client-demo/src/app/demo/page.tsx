import type { Metadata } from "next";
import { AgentDemo } from "@/components/demo/AgentDemo";
import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui";
import type { SimulatedFailure } from "@/lib/api";

export const metadata: Metadata = {
  title: "Experience an AI voice agent",
  description: "Pick a business scenario, play the customer, and see how an AI voice agent handles the call, captures details and takes the next step.",
};

const FAILURES: SimulatedFailure[] = ["unavailable", "timeout", "empty", "expired"];

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = typeof sp.scenario === "string" ? sp.scenario : undefined;
  const sim = typeof sp.simulate === "string" && (FAILURES as string[]).includes(sp.simulate)
    ? (sp.simulate as SimulatedFailure)
    : undefined;

  return (
    <Container className="py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-brand">Interactive demo</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl">
          Experience an AI voice agent.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Pick a business, start the call and play the customer. Answer the agent&apos;s questions, ask for a person, say you&apos;re busy or not interested, and see what it captures and which action it takes.
        </p>
        <p className="mt-4 inline-flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-ink-2 ring-1 ring-line">
          <Icon name="alert" className="mt-px size-4 shrink-0 text-warn" />
          <span>
            <strong className="font-semibold text-ink">This is a simulation.</strong> It runs in your browser and does not connect to our production AI backend. Replies are matched by keyword against a script. No phone call is placed and nothing is stored. A real agent understands free-form speech and is built around your own workflow.
          </span>
        </p>
      </div>
      <div className="mt-10">
        <AgentDemo initialScenario={scenario} simulate={sim} />
      </div>
    </Container>
  );
}
