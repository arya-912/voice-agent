"use client";

import { useState } from "react";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import type { CallStatus, ReplyOption } from "@/types";
import { Icon } from "../Icon";

const MAX_CHARS = 200;

/** Customer-side controls: suggested replies, typed reply, optional mic. */
export function CallControls({
  status,
  replies,
  onReply,
  onText,
}: {
  status: CallStatus;
  replies: ReplyOption[];
  onReply: (r: ReplyOption) => void;
  onText: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const canReply = status === "listening" && replies.length > 0;
  const mic = useSpeechInput((text) => onText(text));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return setInputError("Type a reply first, or pick one of the suggestions.");
    if (text.length > MAX_CHARS) return setInputError(`Keep it under ${MAX_CHARS} characters.`);
    setInputError(null);
    setDraft("");
    onText(text);
  }

  return (
    <div className="border-t border-console-line bg-console-2 px-4 py-4 sm:px-6">
      <p id="reply-hint" className="text-xs text-console-muted">
        {canReply ? "Reply as the customer. Pick a suggestion, type, or use the mic." : status === "speaking" ? "Priya is speaking…" : "Waiting for Priya…"}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Suggested replies">
        {replies.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              disabled={!canReply}
              onClick={() => onReply(r)}
              className="rounded-full bg-console-3 px-3.5 py-2 text-sm text-console-text ring-1 ring-console-line transition-colors hover:bg-white hover:text-ink disabled:opacity-40 disabled:hover:bg-console-3 disabled:hover:text-console-text"
            >
              {r.label}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2" noValidate>
        <label htmlFor="reply-text" className="sr-only">
          Type your reply
        </label>
        <input
          id="reply-text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (inputError) setInputError(null);
          }}
          disabled={!canReply}
          maxLength={MAX_CHARS + 50}
          placeholder="Or type, e.g. “kal tak kar dunga”"
          aria-describedby={inputError ? "reply-error" : "reply-hint"}
          aria-invalid={inputError ? true : undefined}
          className="h-11 min-w-0 flex-1 rounded-full bg-console px-4 text-sm text-console-text ring-1 ring-console-line placeholder:text-console-muted/70 focus:ring-live disabled:opacity-50"
        />
        <button
          type="button"
          onClick={mic.listening ? mic.stop : mic.start}
          disabled={!canReply || !mic.supported}
          aria-pressed={mic.listening}
          aria-label={mic.supported ? (mic.listening ? "Stop voice input" : "Speak your reply") : "Voice input isn't supported in this browser"}
          title={mic.supported ? undefined : "Voice input isn't supported in this browser"}
          className={`relative inline-flex size-11 shrink-0 items-center justify-center rounded-full ring-1 transition-colors disabled:opacity-40 ${
            mic.listening ? "pulse-ring bg-live text-console ring-live" : "bg-console-3 text-console-text ring-console-line hover:bg-console-line"
          }`}
        >
          <Icon name="mic" className="size-5" />
        </button>
        <button
          type="submit"
          disabled={!canReply}
          aria-label="Send reply"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-white/90 disabled:opacity-40"
        >
          <Icon name="send" className="size-4" />
        </button>
      </form>
      {(inputError || mic.error) && (
        <p id="reply-error" role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-amber-300">
          <Icon name="alert" className="size-3.5" />
          {inputError ?? mic.error}
        </p>
      )}
    </div>
  );
}
