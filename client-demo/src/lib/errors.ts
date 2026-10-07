/** Error type shared by every provider; the UI maps codes to friendly copy. */


export type ApiErrorCode =
  | "unavailable"
  | "timeout"
  | "failed"
  | "empty"
  | "invalid_input"
  | "session_expired"
  | "rate_limited"
  | "mic_denied"
  | "disconnected";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

/** What the UI shows for each failure. Never a raw error string. */
export function describeError(err: unknown): {
  title: string;
  body: string;
  retryable: boolean;
} {
  const code: ApiErrorCode = err instanceof ApiError ? err.code : "failed";
  switch (code) {
    case "unavailable":
      return { title: "Agent unavailable", body: "We couldn't reach the voice agent service. Please try again in a moment.", retryable: true };
    case "timeout":
      return { title: "Connection timed out", body: "The agent took too long to respond. Check your connection and try again.", retryable: true };
    case "empty":
      return { title: "No response", body: "The agent didn't return anything for that turn. Try saying it another way.", retryable: true };
    case "invalid_input":
      return { title: "Couldn't send that", body: err instanceof ApiError && err.message !== code ? err.message : "Please enter a short reply and try again.", retryable: true };
    case "rate_limited":
      return { title: "Demo lines are busy", body: err instanceof ApiError && err.message !== code ? err.message : "Too many demo calls right now. Please try again in a few minutes.", retryable: true };
    case "mic_denied":
      return { title: "Microphone needed", body: err instanceof ApiError && err.message !== code ? err.message : "Allow microphone access in your browser to talk to the agent, then try again.", retryable: true };
    case "disconnected":
      return { title: "Call dropped", body: "The connection to the agent was lost. Check your network and start a new call.", retryable: true };
    case "session_expired":
      return { title: "Call session expired", body: "This demo call was idle for too long. Start a new call to continue.", retryable: false };
    default:
      return { title: "Something went wrong", body: "The call couldn't continue. Please start a new call.", retryable: false };
  }
}

