"use client";

import { useEffect, useState } from "react";
import { useAgentCall } from "@/hooks/useAgentCall";
import { defaultScenarioId, getConversation, listScenarios, setSimulatedFailure, type SimulatedFailure } from "@/lib/api";
import { formatDuration, formatInr } from "@/lib/format";
import type { CallStatus, TranscriptEntry } from "@/types";
import { Icon } from "../Icon";
import { VoiceVisualizer } from "../VoiceVisualizer";
import { CallControls } from "./CallControls";
import { OutcomePanel } from "./OutcomePanel";
import { ScenarioPicker } from "./ScenarioPicker";
import { Transcript } from "./Transcript";

const statusMeta: Record<CallStatus, { label: string; icon: React.ComponentProps<typeof Icon>["name"]; tone: string }> = {
  ready: { label: "Ready", icon: "phone", tone: "text-console-muted" },
  connecting: { label: "Connecting…", icon: "phone", tone: "text-amber-300" },
  listening: { label: "Listening…", icon: "mic", tone: "text-live" },
  thinking: { label: "Thinking…", icon: "sparkles", tone: "text-sky-300" },
  speaking: { label: "Speaking…", icon: "volume", tone: "text-live" },
  ended: { label: "Call ended", icon: "phoneOff", tone: "text-console-muted" },
  error: { label: "Connection problem", icon: "alert", tone: "text-red-300" },
};

export function AgentDemo({
  initialScenario,
  simulate,
}: {
  initialScenario?: string;
  simulate?: SimulatedFailure;
}) {
  const scenarios = listScenarios();
  const [scenarioId, setScenarioId] = useState(
    scenarios.some((s) => s.id === initialScenario) ? initialScenario! : defaultScenarioId,
  );
  const [voice, setVoice] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const call = useAgentCall({ voice });
  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const inCall = ["connecting", "listening", "thinking", "speaking"].includes(call.status);
  const meta = statusMeta[call.status];

  useEffect(() => {
    setSimulatedFailure(simulate ?? "none");
  }, [simulate]);

  async function download() {
    let rows: TranscriptEntry[] = call.transcript;
    const id = call.getSessionId();
    if (id) {
      try {
        rows = await getConversation(id);
      } catch {
        /* fall back to what's on screen */
      }
    }
    const blob = new Blob(
      [JSON.stringify({ scenario, result: call.result, collected: call.collected, simulated: true, transcript: rows }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-agent-demo-${scenario.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-8">
      {/* Mobile order: scenario → call → context. Desktop: left column + call on the right. */}
      <div className="lg:col-start-1 lg:row-start-1">
        <ScenarioPicker
          scenarios={scenarios}
          value={scenarioId}
          onChange={(id) => {
            setScenarioId(id);
            if (call.status !== "ready") call.reset();
          }}
          disabled={inCall}
        />
      </div>

      <aside aria-label="Call context and settings" className="order-3 space-y-6 lg:order-none lg:col-start-1 lg:row-start-2">
        <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Call context</p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Business</dt>
              <dd className="text-right text-ink">{scenario.business}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Customer</dt>
              <dd className="text-right text-ink">{scenario.customerName}</dd>
            </div>
            {scenario.amountInr !== undefined && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Amount</dt>
                <dd className="text-right text-ink tabular-nums">{formatInr(scenario.amountInr)}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Why the agent is calling</dt>
              <dd className="mt-0.5 text-ink-2">{scenario.trigger}</dd>
            </div>
            <div>
              <dt className="text-muted">Goal</dt>
              <dd className="mt-0.5 text-ink-2">{scenario.goal}</dd>
            </div>
            {scenario.routingReason && (
              <div>
                <dt className="text-muted">Routing decision</dt>
                <dd className="mt-0.5 font-mono text-xs leading-relaxed text-ink-2">{scenario.routingReason}</dd>
              </div>
            )}
          </dl>
        </div>

        {scenario.group === "business" && (
          <div className="rounded-xl bg-surface p-4 ring-1 ring-line" aria-live="polite">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Details captured</p>
            {Object.keys(call.collected).length ? (
              <dl className="mt-3 space-y-2 text-sm">
                {Object.entries(call.collected).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted">Answers appear here as the agent collects them.</p>
            )}
          </div>
        )}

        <fieldset className="space-y-3 rounded-xl bg-surface p-4 ring-1 ring-line">
          <legend className="sr-only">Demo settings</legend>
          <Toggle
            id="toggle-translation"
            checked={showTranslation}
            onChange={setShowTranslation}
            label="Show English translation"
            hint="For the Hinglish scenarios."
          />
          <Toggle
            id="toggle-voice"
            checked={voice}
            onChange={setVoice}
            label="Read agent lines aloud"
            hint="Uses your browser's voice, not the production Gemini voice."
          />
        </fieldset>
      </aside>

      <div className="order-2 flex flex-col gap-6 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <section
          aria-label="Demo call"
          className="flex h-[640px] flex-col overflow-hidden rounded-3xl bg-console text-console-text shadow-lift ring-1 ring-console-line sm:h-[680px]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-console-line px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <Icon name="wave" className="size-5" strokeWidth={2.25} />
                {inCall && <span aria-hidden className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-live ring-2 ring-console" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{scenario.agentName} · {scenario.business}</p>
                <p className="truncate text-xs text-console-muted">AI voice agent · calling {scenario.customerName} · {scenario.language}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span role="status" className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.tone}`}>
                <Icon name={meta.icon} className="size-3.5" />
                {meta.label}
              </span>
              <span className="font-mono text-xs text-console-muted tabular-nums" aria-label="Call duration">
                {formatDuration(call.elapsed)}
              </span>
            </div>
          </header>

          <div className="border-b border-console-line px-4 py-3 sm:px-6">
            <VoiceVisualizer status={call.status} bars={36} className="h-14" barClassName={call.status === "listening" ? "bg-white" : "bg-live"} />
          </div>

          <Transcript entries={call.transcript} status={call.status} agentName={scenario.agentName} showTranslation={showTranslation} />

          {call.status === "error" && call.error && (
            <div role="alert" className="mx-4 mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 sm:mx-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-red-200">
                <Icon name="alert" className="size-4" />
                {call.error.title}
              </p>
              <p className="mt-1 text-sm text-console-text/80">{call.error.body}</p>
              <button
                type="button"
                onClick={() => call.start(scenarioId)}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-console hover:bg-white/90"
              >
                <Icon name="restart" className="size-4" />
                {call.error.retryable ? "Try again" : "Start a new call"}
              </button>
            </div>
          )}

          {inCall ? (
            <>
              <CallControls
                status={call.status}
                replies={call.replies}
                agentName={scenario.agentName}
                sampleReply={scenario.sampleReply}
                onReply={(r) => call.respond({ replyId: r.id }, r.text, r.translation)}
                onText={(t) => call.respond({ text: t }, t)}
              />
              <div className="flex justify-center border-t border-console-line bg-console-2 px-4 py-3">
                <button
                  type="button"
                  onClick={call.hangUp}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-500"
                >
                  <Icon name="phoneOff" className="size-4" />
                  End call
                </button>
              </div>
            </>
          ) : (
            call.status !== "error" && (
              <div className="flex flex-col items-center gap-2 border-t border-console-line bg-console-2 px-4 py-5">
                <button
                  type="button"
                  onClick={() => call.start(scenarioId)}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-live px-6 text-base font-semibold text-console transition-colors hover:bg-white"
                >
                  <Icon name="phone" className="size-5" />
                  {call.status === "ended" ? "Call again" : "Start call"}
                </button>
                <p className="text-xs text-console-muted">Simulated call · runs in your browser, not on our AI backend</p>
              </div>
            )
          )}
        </section>

        {call.status === "ended" && (
          <OutcomePanel
            result={call.result}
            scenario={scenario}
            collected={call.collected}
            transcript={call.transcript}
            onRestart={() => call.start(scenarioId)}
            onDownload={download}
          />
        )}
      </div>
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
        {hint && <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-brand" : "bg-line-strong"}`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
