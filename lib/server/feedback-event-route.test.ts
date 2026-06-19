import test from "node:test"
import assert from "node:assert/strict"
import { handleFeedbackEventRequest } from "./feedback-event-route.ts"
import type { SaveFeedbackEventFn } from "./feedback-event-route.ts"

const validPayload = {
  safetyEventId: "safety-event-123",
  helpful: true,
  reason: "clear-next-step",
  anonymousSessionId: "session-123",
}

test("handleFeedbackEventRequest saves a valid feedback event", async () => {
  let savedInput: Parameters<SaveFeedbackEventFn>[0] | undefined
  const saveFeedbackEvent: SaveFeedbackEventFn = async (input) => {
    savedInput = input
    return { ok: true, id: "feedback-123" }
  }

  const response = await handleFeedbackEventRequest(validPayload, { saveFeedbackEvent })

  assert.equal(response.status, 201)
  assert.deepEqual(response.body, { ok: true, id: "feedback-123" })
  assert.deepEqual(savedInput, validPayload)
})

test("handleFeedbackEventRequest drops raw message text before saving", async () => {
  let savedInput: Parameters<SaveFeedbackEventFn>[0] | undefined
  const saveFeedbackEvent: SaveFeedbackEventFn = async (input) => {
    savedInput = input
    return { ok: true, id: "feedback-raw" }
  }

  await handleFeedbackEventRequest(
    {
      ...validPayload,
      rawMessage: "My bank password is secret",
    },
    { saveFeedbackEvent },
  )

  assert.equal(savedInput && "rawMessage" in savedInput, false)
  assert.equal(JSON.stringify(savedInput).includes("password"), false)
})

test("handleFeedbackEventRequest rejects payloads without a helpful choice", async () => {
  const response = await handleFeedbackEventRequest(
    { safetyEventId: "safety-event-123" },
    { saveFeedbackEvent: async () => ({ ok: true, id: "should-not-save" }) },
  )

  assert.equal(response.status, 400)
  assert.deepEqual(response.body, { ok: false, reason: "invalid-payload" })
})

test("handleFeedbackEventRequest reports skipped persistence when AWS config is missing", async () => {
  const response = await handleFeedbackEventRequest(validPayload, {
    saveFeedbackEvent: async () => ({
      skipped: true,
      reason: "missing-aws-config",
      missing: ["ASKSAFE_FEEDBACK_TABLE"],
    }),
  })

  assert.equal(response.status, 202)
  assert.deepEqual(response.body, { skipped: true, reason: "missing-aws-config" })
})

test("handleFeedbackEventRequest maps write failures to a generic server error", async () => {
  const response = await handleFeedbackEventRequest(validPayload, {
    saveFeedbackEvent: async () => ({ ok: false, reason: "write-failed" }),
  })

  assert.equal(response.status, 500)
  assert.deepEqual(response.body, { ok: false, reason: "write-failed" })
})
