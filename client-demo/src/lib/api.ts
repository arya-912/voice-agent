/**
 * The demo site's single integration boundary.
 *
 * Components and hooks only call the functions exported here. Today they
 * are backed by an in-browser simulator (lib/mockAgent.ts) and sample
 * analytics (data/analytics.ts), because the core backend does not expose
 * a public, browser-safe session API: its JSON endpoints sit behind a
 * session-cookie login and real calls go over PSTN via LiveKit SIP.
 *
 * To go live, implement a provider with the same `VoiceAgentProvider`
 * shape that calls your backend through `request()`, and return it from
 * `provider()`. See client-demo/README.md, "Connecting the real backend".
 */
import { sampleCalls, sampleSummary } from "@/data/analytics";
import { scenarios } from "@/data/demoConversations";
import type {
  AgentSession,
  AgentTurn,
  AnalyticsSummary,
  CallLogRow,
  DemoScenario,
  TranscriptEntry,
} from "@/types";
import { createMockProvider } from "./mockAgent";

import { ApiError } from "./errors";

export { ApiError, describeError, type ApiErrorCode } from "./errors";

/* ------------------------------------------------------------------ */
/* Transport (for a real backend)                                      */
/* ------------------------------------------------------------------ */

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const REQUEST_TIMEOUT_MS = 10_000;

/** Promise timeout shared by the mock and HTTP paths. */
export function withTimeout<T>(p: Promise<T>, ms = REQUEST_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new ApiError("timeout")), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

/**
 * JSON fetch with timeout and status → ApiError mapping. Not called by
 * the mock provider; it is the building block for a real one.
 * Never put secrets here — anything in NEXT_PUBLIC_* ships to the browser.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError("unavailable", "NEXT_PUBLIC_API_URL is not set");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (e) {
    throw new ApiError((e as Error)?.name === "AbortError" ? "timeout" : "unavailable");
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 401 || res.status === 410) throw new ApiError("session_expired");
  if (res.status === 400 || res.status === 422) throw new ApiError("invalid_input");
  if (res.status >= 500) throw new ApiError("unavailable");
  if (!res.ok) throw new ApiError("failed");
  const text = await res.text();
  if (!text) throw new ApiError("empty");
  return JSON.parse(text) as T;
}

/* ------------------------------------------------------------------ */
/* Voice-agent sessions                                                */
/* ------------------------------------------------------------------ */

export type CustomerInput = { replyId: string } | { text: string };

export interface VoiceAgentProvider {
  startAgentSession(scenarioId: string): Promise<AgentSession>;
  sendMessage(sessionId: string, input: CustomerInput): Promise<AgentTurn>;
  endAgentSession(sessionId: string): Promise<void>;
  getConversation(sessionId: string): Promise<TranscriptEntry[]>;
}

let _provider: VoiceAgentProvider | null = null;
function provider(): VoiceAgentProvider {
  _provider ??= createMockProvider();
  return _provider;
}

/** Failure modes the simulator can be asked to reproduce (/demo?simulate=…). */
export type SimulatedFailure = "none" | "unavailable" | "timeout" | "empty" | "expired";

export function setSimulatedFailure(mode: SimulatedFailure) {
  const p = provider();
  if ("setFailure" in p && typeof p.setFailure === "function") p.setFailure(mode);
}

export const startAgentSession = (scenarioId: string) =>
  withTimeout(provider().startAgentSession(scenarioId));

export const sendMessage = (sessionId: string, input: CustomerInput) =>
  withTimeout(provider().sendMessage(sessionId, input));

export const endAgentSession = (sessionId: string) =>
  withTimeout(provider().endAgentSession(sessionId));

export const getConversation = (sessionId: string) =>
  withTimeout(provider().getConversation(sessionId));

export const listScenarios = (): DemoScenario[] => scenarios;

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

/** Swap for `request<AnalyticsSummary>("/api/summary")` once reachable. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return sampleSummary;
}

/** Swap for `request<CallLogRow[]>("/api/calls")` once reachable. */
export async function getRecentCalls(limit = 5): Promise<CallLogRow[]> {
  return sampleCalls.slice(0, limit);
}

export const ANALYTICS_IS_SAMPLE = true;
