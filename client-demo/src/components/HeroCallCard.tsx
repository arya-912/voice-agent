"use client";

import { useEffect, useState } from "react";
import type { CallStatus } from "@/types";
import { Icon } from "./Icon";
import { VoiceVisualizer } from "./VoiceVisualizer";

type Beat =
  | { kind: "agent" | "customer"; text: string; en: string }
  | { kind: "tool"; text: string };

const beats: Beat[] = [
  { kind: "agent", text: "Namaste! Kya main Rohan Mehta se baat kar rahi hoon?", en: "Hello! Am I speaking with Rohan Mehta?" },
  { kind: "customer", text: "Haan ji, boliye.", en: "Yes, go ahead." },
  { kind: "agent", text: "Aapka ₹2,499 ka payment bank ne decline kiya tha. Fresh link bhej doon?", en: "Your bank declined the ₹2,499 payment. Shall I send a fresh link?" },
  { kind: "customer", text: "Haan, bhej dijiye.", en: "Yes, please send it." },
  { kind: "tool", text: "send_retry_link · consent captured" },
  { kind: "agent", text: "Link bhej diya hai, SMS check kijiye.", en: "Link sent. Please check your SMS." },
];

const STEP_MS = 2400;

/** Hero visual: a looping, illustrative call. Static when reduced motion is on. */
export function HeroCallCard() {
  const [shown, setShown] = useState(beats.length);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    setShown(1);
    const t = setInterval(() => {
      setShown((n) => (n >= beats.length + 2 ? 1 : n + 1));
    }, STEP_MS);
    return () => clearInterval(t);
  }, []);

  const visible = beats.slice(0, Math.min(shown, beats.length));
  const last = visible[visible.length - 1];
  const done = shown > beats.length;
  const status: CallStatus = done ? "ended" : last?.kind === "agent" ? "speaking" : last?.kind === "customer" ? "listening" : "thinking";
  const statusText = done ? "Recovered" : status === "speaking" ? "Speaking" : status === "listening" ? "Listening" : "Taking action";

  return (
    <figure
      aria-label="Illustration of a payment-recovery call in progress"
      className="relative w-full overflow-hidden rounded-3xl bg-console text-console-text shadow-lift ring-1 ring-console-line"
    >
      <div className="flex items-center justify-between border-b border-console-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-10 items-center justify-center rounded-full bg-brand text-white">
            <Icon name="wave" className="size-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-sm font-semibold">Priya · Payment Retry Agent</p>
            <p className="text-xs text-console-muted">Outbound · +91 98•••• 4417</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-console-3 px-2.5 py-1 text-xs font-medium">
          <span className={`size-1.5 rounded-full ${done ? "bg-console-muted" : "bg-live"}`} aria-hidden />
          {statusText}
        </span>
      </div>

      <div className="px-5 pt-4">
        <VoiceVisualizer status={reduced ? "speaking" : status} bars={28} className="h-12" />
      </div>

      <ol className="flex h-[300px] flex-col justify-end gap-2.5 overflow-hidden px-5 pt-2 pb-5 [mask-image:linear-gradient(to_bottom,transparent,black_18%)] sm:h-[320px]" aria-live="off">
        {visible.map((b, i) =>
          b.kind === "tool" ? (
            <li key={i} className="animate-fade-up flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-live/30 bg-live/10 px-3 py-1 font-mono text-[11px] text-live">
                <Icon name="check" className="size-3.5" strokeWidth={2.5} />
                {b.text}
              </span>
            </li>
          ) : (
            <li key={i} className={`animate-fade-up flex ${b.kind === "customer" ? "justify-end" : ""}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                  b.kind === "agent" ? "rounded-tl-sm bg-console-3" : "rounded-tr-sm bg-white text-ink"
                }`}
              >
                <p>{b.text}</p>
                <p className={`mt-1 text-xs ${b.kind === "agent" ? "text-console-muted" : "text-muted"}`}>{b.en}</p>
              </div>
            </li>
          ),
        )}
      </ol>

      <figcaption className="flex items-center justify-between border-t border-console-line bg-console-2 px-5 py-3 text-xs text-console-muted">
        <span>Illustrative call · fictional customer</span>
        <span className="font-mono">payment_retry · ₹2,499</span>
      </figcaption>
    </figure>
  );
}
