import type { RiskLevel } from "./analyze.ts"

export type FeedbackEventRecordInput = {
  safetyEventId?: string
  helpful: boolean
  reason?: string
  anonymousSessionId?: string
  risk?: RiskLevel
  riskSignalIds?: string[]
  clarificationNeeded?: boolean
}

export type SupportEventAction = "setup-opened" | "code-created" | "summary-shared"

export type SupportEventRecordInput = {
  safetyEventId?: string
  action: SupportEventAction
  anonymousSessionId?: string
}

export type FeedbackEventPayload = {
  safetyEventId?: string
  helpful: boolean
  reason?: string
  anonymousSessionId?: string
  risk?: RiskLevel
  riskSignalIds?: string[]
  clarificationNeeded?: boolean
}

export type SupportEventPayload = {
  safetyEventId?: string
  action: SupportEventAction
  anonymousSessionId?: string
}

type RecordOutcomeEventOptions = {
  fetch?: typeof globalThis.fetch
}

export function buildFeedbackEventPayload(
  input: FeedbackEventRecordInput,
): FeedbackEventPayload {
  return {
    safetyEventId: input.safetyEventId,
    helpful: input.helpful,
    reason: input.reason,
    anonymousSessionId: input.anonymousSessionId,
    risk: input.risk,
    riskSignalIds: input.riskSignalIds,
    clarificationNeeded: input.clarificationNeeded,
  }
}

export function buildSupportEventPayload(
  input: SupportEventRecordInput,
): SupportEventPayload {
  return {
    safetyEventId: input.safetyEventId,
    action: input.action,
    anonymousSessionId: input.anonymousSessionId,
  }
}

export async function recordFeedbackEvent(
  input: FeedbackEventRecordInput,
  options: RecordOutcomeEventOptions = {},
): Promise<{ ok: boolean }> {
  return recordOutcomeEvent(
    "/api/feedback-events",
    buildFeedbackEventPayload(input),
    options,
  )
}

export async function recordSupportEvent(
  input: SupportEventRecordInput,
  options: RecordOutcomeEventOptions = {},
): Promise<{ ok: boolean }> {
  return recordOutcomeEvent(
    "/api/support-events",
    buildSupportEventPayload(input),
    options,
  )
}

async function recordOutcomeEvent(
  url: string,
  payload: FeedbackEventPayload | SupportEventPayload,
  options: RecordOutcomeEventOptions,
): Promise<{ ok: boolean }> {
  const fetchImpl = options.fetch ?? globalThis.fetch

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    return { ok: response.ok }
  } catch {
    return { ok: false }
  }
}
