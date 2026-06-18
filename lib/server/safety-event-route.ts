import { saveSafetyEvent, type PersistenceResult, type SafetyEventInput } from "./persistence.ts"
import type { Category, RequestType, RiskLevel } from "../analyze.ts"
import type { RiskSignal } from "../safety-rules.ts"

export type SaveSafetyEventFn = (input: SafetyEventInput) => Promise<PersistenceResult>

type SafetyEventResponse =
  | { status: 201; body: { ok: true; id: string } }
  | { status: 202; body: { skipped: true; reason: "missing-aws-config" } }
  | { status: 400; body: { ok: false; reason: "invalid-payload" } }
  | { status: 500; body: { ok: false; reason: "write-failed" } }

type SafetyEventRouteOptions = {
  saveSafetyEvent?: SaveSafetyEventFn
}

const CATEGORIES: readonly Category[] = [
  "money",
  "message",
  "caller",
  "door",
  "online",
  "video",
  "other",
]

const REQUEST_TYPES: readonly RequestType[] = [
  "pay",
  "link",
  "code",
  "details",
  "callback",
  "install",
  "screen",
  "unsure",
]

const RISK_LEVELS: readonly RiskLevel[] = ["low", "caution", "high"]
const SIGNAL_SEVERITIES = ["high", "caution"] as const

export async function handleSafetyEventRequest(
  payload: unknown,
  options: SafetyEventRouteOptions = {},
): Promise<SafetyEventResponse> {
  const input = parseSafetyEventPayload(payload)

  if (!input) {
    return {
      status: 400,
      body: { ok: false, reason: "invalid-payload" },
    }
  }

  const persist = options.saveSafetyEvent ?? saveSafetyEvent
  const result = await persist(input)

  if ("skipped" in result) {
    return {
      status: 202,
      body: { skipped: true, reason: "missing-aws-config" },
    }
  }

  if (!result.ok) {
    return {
      status: 500,
      body: { ok: false, reason: "write-failed" },
    }
  }

  return {
    status: 201,
    body: { ok: true, id: result.id },
  }
}

function parseSafetyEventPayload(payload: unknown): SafetyEventInput | null {
  if (!isRecord(payload)) return null
  if (!isCategory(payload.category)) return null
  if (!isRequestArray(payload.requests)) return null
  if (!isRecord(payload.result)) return null
  if (!isRiskLevel(payload.result.risk)) return null
  if (!isRiskSignalArray(payload.result.riskSignals)) return null
  if (!isStringArray(payload.result.scamTypeIds)) return null
  if (!isStringArray(payload.result.sourceIds)) return null

  const anonymousSessionId =
    typeof payload.anonymousSessionId === "string"
      ? payload.anonymousSessionId
      : undefined

  return {
    category: payload.category,
    requests: payload.requests,
    result: {
      risk: payload.result.risk,
      riskSignals: payload.result.riskSignals,
      scamTypeIds: payload.result.scamTypeIds,
      sourceIds: payload.result.sourceIds,
    },
    anonymousSessionId,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.includes(value as Category)
}

function isRequestArray(value: unknown): value is RequestType[] {
  return Array.isArray(value) && value.every((item) => REQUEST_TYPES.includes(item))
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === "string" && RISK_LEVELS.includes(value as RiskLevel)
}

function isRiskSignalArray(value: unknown): value is RiskSignal[] {
  return Array.isArray(value) && value.every(isRiskSignal)
}

function isRiskSignal(value: unknown): value is RiskSignal {
  if (!isRecord(value)) return false
  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.severity === "string" &&
    SIGNAL_SEVERITIES.includes(value.severity as (typeof SIGNAL_SEVERITIES)[number])
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}