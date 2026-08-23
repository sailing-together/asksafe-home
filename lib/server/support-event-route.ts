import {
  saveSupportEvent,
  type PersistenceResult,
  type SupportEventInput,
} from "./persistence.ts"

export type SaveSupportEventFn = (input: SupportEventInput) => Promise<PersistenceResult>

type SupportEventResponse =
  | { status: 201; body: { ok: true; id: string } }
  | { status: 202; body: { skipped: true; reason: "missing-aws-config" } }
  | { status: 400; body: { ok: false; reason: "invalid-payload" } }
  | { status: 500; body: { ok: false; reason: "write-failed" } }

type SupportEventRouteOptions = {
  saveSupportEvent?: SaveSupportEventFn
}

const SUPPORT_ACTIONS: readonly SupportEventInput["action"][] = [
  "setup-opened",
  "summary-shared",
]

export async function handleSupportEventRequest(
  payload: unknown,
  options: SupportEventRouteOptions = {},
): Promise<SupportEventResponse> {
  const input = parseSupportEventPayload(payload)

  if (!input) {
    return {
      status: 400,
      body: { ok: false, reason: "invalid-payload" },
    }
  }

  const persist = options.saveSupportEvent ?? saveSupportEvent
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

function parseSupportEventPayload(payload: unknown): SupportEventInput | null {
  if (!isRecord(payload)) return null
  if (!isSupportAction(payload.action)) return null

  const safetyEventId =
    typeof payload.safetyEventId === "string" ? payload.safetyEventId : undefined
  const anonymousSessionId =
    typeof payload.anonymousSessionId === "string"
      ? payload.anonymousSessionId
      : undefined

  return {
    safetyEventId,
    action: payload.action,
    anonymousSessionId,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isSupportAction(value: unknown): value is SupportEventInput["action"] {
  return (
    typeof value === "string" &&
    SUPPORT_ACTIONS.includes(value as SupportEventInput["action"])
  )
}
