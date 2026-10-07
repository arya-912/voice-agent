/**
 * The demo site's single integration boundary.
 *
 * Components and hooks only call the functions exported here.
 *
 * - Live calls: when NEXT_PUBLIC_API_URL points at the core backend, the
 *   three payment-recovery scenarios talk to the real agent (Gemini Live
 *   via LiveKit, voice/flow.py) over the visitor's microphone. The backend
 *   (metrics/demo_api.py) mints a one-room token; lib/liveAgent.ts joins.
 * - Simulated calls: every other scenario, and all scenarios when no
 *   backend is configured, run on the in-browser simulator
 *   (lib/mockAgent.ts, scenarios in data/demoScenarios.ts).
 * - Analytics stay sample data (data/analytics.ts): the real dashboard is
 *   merchant data behind a login and must not appear on a public site.
 */
import { sampleCalls, sampleSummary } from "@/data/analytics";
import { DEFAULT_SCENARIO, scenarios } from "@/data/demoScenarios";
import type {
  AgentSession,
  AgentTurn,
  AnalyticsSummary,
  CallLogRow,
  CallResult,
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
  if (res.status === 400 || res.status === 422) throw new ApiError("invalid_input", await detail(res));
  if (res.status === 429) throw new ApiError("rate_limited", await detail(res));
  if (res.status >= 500) throw new ApiError("unavailable");
  if (!res.ok) throw new ApiError("failed");
  const text = await res.text();
  if (!text) throw new ApiError("empty");
  return JSON.parse(text) as T;
}

/** The backend's `{"detail": "..."}` message, when it sent a readable one. */
async function detail(res: Response): Promise<string | undefined> {
  try {
    const d = (await res.json())?.detail;
    return typeof d === "string" ? d : undefined;
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Live calls to the real agent (metrics/demo_api.py)                  */
/* ------------------------------------------------------------------ */

/** Scenarios backed by the real agent (voice/demo.py SCENARIOS). */
const LIVE_SCENARIO_IDS = new Set(["payment_retry", "checkout_abandonment", "mandate_failure"]);

/** True when a backend is configured, so recovery scenarios run live. */
export const LIVE_DEMO_ENABLED = API_URL !== "";

export const isLiveScenario = (scenarioId: string) =>
  LIVE_DEMO_ENABLED && LIVE_SCENARIO_IDS.has(scenarioId);

export interface LiveSession {
  session_id: string;
  scenario_id: string;
  livekit_url: string;
  /** Short-lived token that can join only this call's room. */
  token: string;
  expires_at: string;
}

export interface LiveOutcome {
  result: CallResult | null;
  duration_s?: number;
  error?: string | null;
  transcript?: { role: string; text: string }[];
}

export interface LiveSessionStatus {
  session_id: string;
  status: "pending" | "ended";
  outcome: LiveOutcome | null;
}

export const startLiveSession = (scenarioId: string) =>
  request<LiveSession>("/api/demo/session", { method: "POST", body: JSON.stringify({ scenario_id: scenarioId }) });

export const getLiveSession = (sessionId: string) =>
  request<LiveSessionStatus>(`/api/demo/session/${encodeURIComponent(sessionId)}`);

export const endLiveSession = (sessionId: string) =>
  request<{ ok: boolean }>(`/api/demo/session/${encodeURIComponent(sessionId)}/end`, { method: "POST" });

/** Best-effort hang-up while the page is unloading (fetch may not finish). */
export function endLiveSessionOnUnload(sessionId: string) {
  if (!API_URL || typeof navigator === "undefined" || !navigator.sendBeacon) return;
  navigator.sendBeacon(`${API_URL}/api/demo/session/${encodeURIComponent(sessionId)}/end`);
}

/* ------------------------------------------------------------------ */
/* Voice-agent sessions (simulator)                                    */
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

export const defaultScenarioId = DEFAULT_SCENARIO;

/** True while the demo runs on the in-browser simulator rather than a real backend. */
export const DEMO_IS_SIMULATED = true;

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
