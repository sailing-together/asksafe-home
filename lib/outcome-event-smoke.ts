export const SAFETY_EVENT_SMOKE_PAYLOAD = {
  category: "message",
  requests: ["link"],
  result: {
    risk: "caution",
    riskSignals: [
      {
        id: "smoke-link-request",
        label: "asking you to use a link",
        severity: "caution",
      },
    ],
    scamTypeIds: ["smoke-pattern"],
    sourceIds: ["smoke-source"],
  },
  anonymousSessionId: "smoke-session",
} as const

export const FEEDBACK_EVENT_SMOKE_PAYLOAD = {
  safetyEventId: "smoke-safety-event",
  helpful: true,
  reason: "smoke-test",
  anonymousSessionId: "smoke-session",
  risk: "caution",
  riskSignalIds: ["smoke-risk-signal"],
  clarificationNeeded: false,
} as const

export const SUPPORT_EVENT_SMOKE_PAYLOAD = {
  safetyEventId: "smoke-safety-event",
  action: "summary-shared",
  anonymousSessionId: "smoke-session",
} as const

export type OutcomeEventSmokeEvaluation =
  | { ok: true; persisted: true; id: string }
  | {
      ok: false
      persisted: false
      reason: "missing-aws-config" | "http-error" | "malformed-response"
      status?: number
    }

export function evaluateOutcomeEventSmokeResponse(
  status: number,
  body: unknown,
): OutcomeEventSmokeEvaluation {
  if (isRecord(body) && body.ok === true && typeof body.id === "string" && status === 201) {
    return {
      ok: true,
      persisted: true,
      id: body.id,
    }
  }

  if (
    status === 202 &&
    isRecord(body) &&
    body.skipped === true &&
    body.reason === "missing-aws-config"
  ) {
    return {
      ok: false,
      persisted: false,
      reason: "missing-aws-config",
    }
  }

  if (status >= 400) {
    return {
      ok: false,
      persisted: false,
      reason: "http-error",
      status,
    }
  }

  return {
    ok: false,
    persisted: false,
    reason: "malformed-response",
    status,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
