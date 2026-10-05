"use client";

import { useEffect, useState } from "react";
import type { CallStatus } from "@/types";
import { Icon } from "./Icon";
import { VoiceVisualizer } from "./VoiceVisualizer";

type Beat =
  | { kind: "agent" | "customer"; text: string }
  | { kind: "tool"; text: string; action: string };

const beats: Beat[] = [
  { kind: "agent", text: "Hi, this is Aisha, an AI assistant from Northgate Realty. You enquired about a 2BHK in Whitefield. Are you still looking?" },
  { kind: "customer", text: "Yes, I am. Something around 85 lakh." },
  { kind: "agent", text: "Great. And when are you planning to buy?" },
  { kind: "customer", text: "In the next three months." },
  { kind: "tool", text: "record_details · budget ₹85L · 3 months", action: "Lead qualified" },
  { kind: "agent", text: "Would a site visit this Saturday at 11 work for you?" },
  { kind: "customer", text: "Saturday works." },
  { kind: "tool", text: "book_appointment · Sat 11:00", action: "Site visit booked" },
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
  const statusText = done ? "Call ended" : status === "speaking" ? "Speaking" : status === "listening" ? "Listening" : "Taking action";
  const actions = visible.filter((b): b is Extract<Beat, { kind: "tool" }> => b.kind === "tool");

  return (
    <figure
      aria-label="Illustration of an AI voice agent calling a real-estate lead"
      className="relative w-full overflow-hidden rounded-3xl bg-console text-console-text shadow-lift ring-1 ring-console-line"
    >
      <div className="flex items-center justify-between border-b border-console-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-10 items-center justify-center rounded-full bg-brand text-white">
            <Icon name="wave" className="size-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-sm font-semibold">Aisha · AI voice agent</p>
            <p className="text-xs text-console-muted">Outbound · new lead · +91 98•••• 4417</p>
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

      <ol className="flex h-[280px] flex-col justify-end gap-2.5 overflow-hidden px-5 pt-2 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_18%)] sm:h-[300px]" aria-live="off">
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
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                  b.kind === "agent" ? "rounded-tl-sm bg-console-3" : "rounded-tr-sm bg-white text-console"
                }`}
              >
                {b.text}
              </p>
            </li>
          ),
        )}
      </ol>

      <div className="border-t border-console-line px-5 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-console-muted uppercase">Agent actions</p>
        <ul className="mt-2 flex min-h-7 flex-wrap gap-2">
          {actions.length ? (
            actions.map((a) => (
              <li key={a.action} className="animate-fade-up inline-flex items-center gap-1.5 rounded-md bg-console-3 px-2 py-1 text-xs">
                <Icon name="check" className="size-3.5 text-live" strokeWidth={2.5} />
                {a.action}
              </li>
            ))
          ) : (
            <li className="py-1 text-xs text-console-muted">Listening for what the customer needs…</li>
          )}
        </ul>
      </div>

      <figcaption className="flex items-center justify-between border-t border-console-line bg-console-2 px-5 py-3 text-xs text-console-muted">
        <span>Illustrative call · fictional business</span>
        <span className="font-mono">real estate · lead follow-up</span>
      </figcaption>
    </figure>
  );
}
