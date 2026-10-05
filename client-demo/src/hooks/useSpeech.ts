"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Optional read-aloud using the browser's built-in speech synthesis.
 * This is NOT the production voice (Gemini Live) — it's only so the
 * demo can be heard. Resolves when the utterance ends, or immediately
 * when disabled or unsupported.
 */
export function useSpeech(enabled: boolean) {
  const enabledRef = useRef(enabled);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [enabled]);

  useEffect(() => setSupported("speechSynthesis" in window), []);

  const pickVoice = useCallback((language: "English" | "Hinglish") => {
    const voices = window.speechSynthesis.getVoices();
    return (
      (language === "Hinglish" ? voices.find((v) => v.lang === "hi-IN") : undefined) ??
      voices.find((v) => v.lang === "en-IN") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      null
    );
  }, []);

  const speak = useCallback(
    (text: string, language: "English" | "Hinglish" = "Hinglish") =>
      new Promise<void>((resolve) => {
        if (!supported || !enabledRef.current) return resolve();
        try {
          const u = new SpeechSynthesisUtterance(text.replace(/₹/g, "rupees "));
          const v = pickVoice(language);
          if (v) {
            u.voice = v;
            u.lang = v.lang;
          }
          u.rate = 1.02;
          // Some browsers never fire onend; don't let the call stall.
          const guard = setTimeout(resolve, 12_000);
          u.onend = u.onerror = () => {
            clearTimeout(guard);
            resolve();
          };
          window.speechSynthesis.speak(u);
        } catch {
          resolve();
        }
      }),
    [pickVoice, supported],
  );

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return useMemo(() => ({ speak, cancel, supported }), [speak, cancel, supported]);
}
