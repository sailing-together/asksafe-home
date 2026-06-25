import {
  FEEDBACK_EVENT_SMOKE_PAYLOAD,
  SAFETY_EVENT_SMOKE_PAYLOAD,
  SUPPORT_EVENT_SMOKE_PAYLOAD,
  evaluateOutcomeEventSmokeResponse,
} from "../lib/outcome-event-smoke.ts"

const DEFAULT_BASE_URL = "https://asksafe-home.vercel.app"

const baseUrl =
  process.argv.find((arg, index) => index > 1 && !arg.startsWith("--")) ??
  process.env.ASKSAFE_SMOKE_BASE_URL ??
  DEFAULT_BASE_URL

void main()

async function main() {
  const safety = await postAndEvaluate(
    "/api/safety-events",
    SAFETY_EVENT_SMOKE_PAYLOAD,
  )
  const safetyEventId = safety.ok && "id" in safety ? safety.id : "smoke-safety-event"
  const feedback = await postAndEvaluate(
    "/api/feedback-events",
    {
      ...FEEDBACK_EVENT_SMOKE_PAYLOAD,
      safetyEventId,
    },
  )
  const support = await postAndEvaluate(
    "/api/support-events",
    {
      ...SUPPORT_EVENT_SMOKE_PAYLOAD,
      safetyEventId,
    },
  )

  const summary = {
    baseUrl,
    safety,
    feedback,
    support,
  }

  if (!safety.ok || !feedback.ok || !support.ok) {
    fail(summary)
  }

  console.log(JSON.stringify(summary, null, 2))
}

async function postAndEvaluate(path: string, payload: unknown) {
  const endpoint = new URL(path, baseUrl)

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const body: unknown = await response.json()

    return {
      endpoint: endpoint.toString(),
      ...evaluateOutcomeEventSmokeResponse(response.status, body),
    }
  } catch (error) {
    return {
      endpoint: endpoint.toString(),
      ok: false,
      persisted: false,
      reason: "request-failed",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function fail(details: unknown): never {
  console.error(JSON.stringify(details, null, 2))
  process.exit(1)
}
