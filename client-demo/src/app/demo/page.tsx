import type { Metadata } from "next";
import { AgentDemo } from "@/components/demo/AgentDemo";
import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui";
import type { SimulatedFailure } from "@/lib/api";

export const metadata: Metadata = {
  title: "Interactive demo",
  description: "Play the customer on a simulated Hinglish payment-recovery call and see what the agent does.",
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
          You&apos;re the customer. See how the agent handles you.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Agree, push back, ask if it&apos;s a bot, offer your card number or tell it never to call again. Every reply follows the production call flow and fires the same tools.
        </p>
        <p className="mt-4 inline-flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-ink-2 ring-1 ring-line">
          <Icon name="alert" className="mt-px size-4 shrink-0 text-warn" />
          <span>
            This is a scripted simulation that runs in your browser. Replies are matched by keyword, not by the live model. No phone call is placed and nothing is stored.
          </span>
        </p>
      </div>
      <div className="mt-10">
        <AgentDemo initialScenario={scenario} simulate={sim} />
      </div>
    </Container>
  );
}
