import {
  saveFeedbackEvent,
  type FeedbackEventInput,
  type PersistenceResult,
} from "./persistence.ts"
import type { RiskLevel } from "../analyze.ts"

export type SaveFeedbackEventFn = (input: FeedbackEventInput) => Promise<PersistenceResult>

type FeedbackEventResponse =
  | { status: 201; body: { ok: true; id: string } }
  | { status: 202; body: { skipped: true; reason: "missing-aws-config" } }
  | { status: 400; body: { ok: false; reason: "invalid-payload" } }
  | { status: 500; body: { ok: false; reason: "write-failed" } }

type FeedbackEventRouteOptions = {
  saveFeedbackEvent?: SaveFeedbackEventFn
}

export async function handleFeedbackEventRequest(
  payload: unknown,
  options: FeedbackEventRouteOptions = {},
): Promise<FeedbackEventResponse> {
  const input = parseFeedbackEventPayload(payload)

  if (!input) {
    return {
      status: 400,
      body: { ok: false, reason: "invalid-payload" },
    }
  }

  const persist = options.saveFeedbackEvent ?? saveFeedbackEvent
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

function parseFeedbackEventPayload(payload: unknown): FeedbackEventInput | null {
  if (!isRecord(payload)) return null
  if (typeof payload.helpful !== "boolean") return null

  const safetyEventId =
    typeof payload.safetyEventId === "string" ? payload.safetyEventId : undefined
  const reason = typeof payload.reason === "string" ? payload.reason : undefined
  const anonymousSessionId =
    typeof payload.anonymousSessionId === "string"
      ? payload.anonymousSessionId
      : undefined
  const risk = isRiskLevel(payload.risk) ? payload.risk : undefined
  const riskSignalIds = Array.isArray(payload.riskSignalIds)
    ? payload.riskSignalIds.filter((id): id is string => typeof id === "string")
    : undefined
  const clarificationNeeded =
    typeof payload.clarificationNeeded === "boolean"
      ? payload.clarificationNeeded
      : undefined

  return {
    safetyEventId,
    helpful: payload.helpful,
    reason,
    anonymousSessionId,
    risk,
    riskSignalIds,
    clarificationNeeded,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "low" || value === "caution" || value === "high"
}
