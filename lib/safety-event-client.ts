import type { Category, RequestType, SafetyResult } from "./analyze.ts"

export type SafetyEventRecordInput = {
  category: Category
  requests: RequestType[]
  result: SafetyResult
  anonymousSessionId?: string
}

export type SafetyEventPayload = {
  category: Category
  requests: RequestType[]
  result: {
    risk: SafetyResult["risk"]
    riskSignals: SafetyResult["riskSignals"]
    scamTypeIds: SafetyResult["scamTypeIds"]
    sourceIds: SafetyResult["sourceIds"]
  }
  anonymousSessionId?: string
}

type RecordSafetyEventOptions = {
  fetch?: typeof globalThis.fetch
}

export function buildSafetyEventPayload(input: SafetyEventRecordInput): SafetyEventPayload {
  return {
    category: input.category,
    requests: input.requests,
    result: {
      risk: input.result.risk,
      riskSignals: input.result.riskSignals,
      scamTypeIds: input.result.scamTypeIds,
      sourceIds: input.result.sourceIds,
    },
    anonymousSessionId: input.anonymousSessionId,
  }
}

export async function recordSafetyEvent(
  input: SafetyEventRecordInput,
  options: RecordSafetyEventOptions = {},
): Promise<{ ok: boolean; id?: string }> {
  const fetchImpl = options.fetch ?? globalThis.fetch

  try {
    const response = await fetchImpl("/api/safety-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSafetyEventPayload(input)),
    })

    const id = await readResponseId(response)
    return response.ok ? { ok: true, id } : { ok: false }
  } catch {
    return { ok: false }
  }
}

async function readResponseId(response: Response): Promise<string | undefined> {
  try {
    const body = await response.json()
    return typeof body?.id === "string" ? body.id : undefined
  } catch {
    return undefined
  }
}
