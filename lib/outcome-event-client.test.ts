import test from "node:test"
import assert from "node:assert/strict"
import {
  buildFeedbackEventPayload,
  buildSupportEventPayload,
  recordFeedbackEvent,
  recordSupportEvent,
} from "./outcome-event-client.ts"

test("buildFeedbackEventPayload keeps only outcome metadata", () => {
  const payload = buildFeedbackEventPayload({
    safetyEventId: "safety-event-123",
    helpful: false,
    reason: "too-confusing",
    anonymousSessionId: "session-123",
    rawMessage: "My password is secret",
  } as Parameters<typeof buildFeedbackEventPayload>[0] & { rawMessage: string })

  assert.deepEqual(payload, {
    safetyEventId: "safety-event-123",
    helpful: false,
    reason: "too-confusing",
    anonymousSessionId: "session-123",
  })
  assert.equal(JSON.stringify(payload).includes("password"), false)
})

test("buildSupportEventPayload keeps only consent action metadata", () => {
  const payload = buildSupportEventPayload({
    safetyEventId: "safety-event-123",
    action: "summary-shared",
    anonymousSessionId: "session-123",
    trustedEmail: "sarah@example.com",
  } as Parameters<typeof buildSupportEventPayload>[0] & { trustedEmail: string })

  assert.deepEqual(payload, {
    safetyEventId: "safety-event-123",
    action: "summary-shared",
    anonymousSessionId: "session-123",
  })
  assert.equal(JSON.stringify(payload).includes("sarah@example.com"), false)
})

test("recordFeedbackEvent posts outcome metadata to the feedback API", async () => {
  let requestUrl = ""
  let requestInit: RequestInit | undefined
  const fetchImpl: typeof fetch = async (url, init) => {
    requestUrl = String(url)
    requestInit = init
    return new Response(JSON.stringify({ ok: true, id: "feedback-123" }), { status: 201 })
  }

  const result = await recordFeedbackEvent(
    { safetyEventId: "safety-event-123", helpful: true, reason: "clear-next-step" },
    { fetch: fetchImpl },
  )

  assert.deepEqual(result, { ok: true })
  assert.equal(requestUrl, "/api/feedback-events")
  assert.equal(requestInit?.method, "POST")
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    safetyEventId: "safety-event-123",
    helpful: true,
    reason: "clear-next-step",
  })
})

test("recordSupportEvent posts consent action metadata to the support API", async () => {
  let requestUrl = ""
  let requestInit: RequestInit | undefined
  const fetchImpl: typeof fetch = async (url, init) => {
    requestUrl = String(url)
    requestInit = init
    return new Response(JSON.stringify({ ok: true, id: "support-123" }), { status: 201 })
  }

  const result = await recordSupportEvent(
    { action: "setup-opened", anonymousSessionId: "session-123" },
    { fetch: fetchImpl },
  )

  assert.deepEqual(result, { ok: true })
  assert.equal(requestUrl, "/api/support-events")
  assert.equal(requestInit?.method, "POST")
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    action: "setup-opened",
    anonymousSessionId: "session-123",
  })
})

test("outcome event clients fail softly when requests fail", async () => {
  const feedback = await recordFeedbackEvent(
    { helpful: false },
    { fetch: async () => new Response(JSON.stringify({ ok: false }), { status: 500 }) },
  )
  const support = await recordSupportEvent(
    { action: "code-created" },
    { fetch: async () => { throw new Error("network down") } },
  )

  assert.deepEqual(feedback, { ok: false })
  assert.deepEqual(support, { ok: false })
})
