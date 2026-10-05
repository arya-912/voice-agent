"use client";

import { useEffect, useRef } from "react";
import type { CallStatus, TranscriptEntry } from "@/types";
import { Icon } from "../Icon";

export function Transcript({
  entries,
  status,
  agentName,
  showTranslation,
}: {
  entries: TranscriptEntry[];
  status: CallStatus;
  agentName: string;
  showTranslation: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the newest line in view without scrolling the page itself.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [entries.length, status]);

  return (
    <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6" tabIndex={0} aria-label="Call transcript">
      {entries.length === 0 && status === "ready" ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-sm text-console-muted">
          <Icon name="phone" className="size-6" />
          <p className="mt-3 max-w-xs">Start the call. Priya speaks first, and you reply as the customer.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-3" aria-live="polite" aria-relevant="additions">
          {entries.map((e) => {
            if (e.speaker === "system") {
              return e.tool ? (
                <li key={e.id} className="animate-fade-up flex justify-center">
                  <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-live/30 bg-live/10 px-3 py-1.5 text-xs text-live">
                    <span className="inline-flex items-center gap-1 font-mono font-medium">
                      <Icon name="code" className="size-3.5" />
                      {e.tool}()
                    </span>
                    <span className="text-console-text/80">{e.text}</span>
                  </span>
                </li>
              ) : (
                <li key={e.id} className="animate-fade-up text-center text-xs text-console-muted">
                  {e.text}
                </li>
              );
            }
            const agent = e.speaker === "agent";
            return (
              <li key={e.id} className={`animate-fade-up flex flex-col ${agent ? "items-start" : "items-end"}`}>
                <span className="mb-1 text-[11px] font-medium text-console-muted">{agent ? agentName : "You (customer)"}</span>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[80%] ${
                    agent ? "rounded-tl-sm bg-console-3 text-console-text" : "rounded-tr-sm bg-white text-ink"
                  }`}
                >
                  <p>{e.text}</p>
                  {showTranslation && e.translation && (
                    <p className={`mt-1 text-xs ${agent ? "text-console-muted" : "text-muted"}`}>{e.translation}</p>
                  )}
                </div>
              </li>
            );
          })}
          {status === "thinking" && (
            <li className="flex items-center gap-1.5 pl-1" aria-label={`${agentName} is thinking`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="thinking-dot size-1.5 rounded-full bg-console-muted" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </li>
          )}
        </ol>
      )}
    </div>
  );
}
