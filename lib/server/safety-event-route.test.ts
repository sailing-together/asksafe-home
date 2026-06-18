import test from "node:test"
import assert from "node:assert/strict"
import { handleSafetyEventRequest } from "./safety-event-route.ts"
import type { SaveSafetyEventFn } from "./safety-event-route.ts"

const validPayload = {
  category: "message",
  requests: ["link", "details"],
  result: {
    risk: "high",
    riskSignals: [
      { id: "link-request", label: "asking you to use a link", severity: "caution" },
      { id: "personal-details", label: "asking for personal details", severity: "high" },
    ],
    scamTypeIds: ["phishing-message"],
    sourceIds: ["scamwatch"],
  },
  anonymousSessionId: "session-123",
}

test("handleSafetyEventRequest saves a valid sanitized safety event", async () => {
  let savedInput: Parameters<SaveSafetyEventFn>[0] | undefined
  const saveSafetyEvent: SaveSafetyEventFn = async (input) => {
    savedInput = input
    return { ok: true, id: "event-123" }
  }

  const response = await handleSafetyEventRequest(validPayload, { saveSafetyEvent })

  assert.equal(response.status, 201)
  assert.deepEqual(response.body, { ok: true, id: "event-123" })
  assert.deepEqual(savedInput, validPayload)
})

test("handleSafetyEventRequest drops raw message text before saving", async () => {
  let savedInput: Parameters<SaveSafetyEventFn>[0] | undefined
  const saveSafetyEvent: SaveSafetyEventFn = async (input) => {
    savedInput = input
    return { ok: true, id: "event-raw" }
  }

  await handleSafetyEventRequest(
    {
      ...validPayload,
      rawMessage: "My private bank password is secret",
    },
    { saveSafetyEvent },
  )

  assert.equal(savedInput && "rawMessage" in savedInput, false)
  assert.equal(JSON.stringify(savedInput).includes("password"), false)
})

test("handleSafetyEventRequest rejects missing required payload fields", async () => {
  const response = await handleSafetyEventRequest(
    { category: "message", requests: ["link"] },
    { saveSafetyEvent: async () => ({ ok: true, id: "should-not-save" }) },
  )

  assert.equal(response.status, 400)
  assert.deepEqual(response.body, {
    ok: false,
    reason: "invalid-payload",
  })
})

test("handleSafetyEventRequest reports skipped persistence when AWS config is missing", async () => {
  const response = await handleSafetyEventRequest(validPayload, {
    saveSafetyEvent: async () => ({
      skipped: true,
      reason: "missing-aws-config",
      missing: ["ASKSAFE_EVENTS_TABLE"],
    }),
  })

  assert.equal(response.status, 202)
  assert.deepEqual(response.body, {
    skipped: true,
    reason: "missing-aws-config",
  })
})

test("handleSafetyEventRequest maps write failures to a generic server error", async () => {
  const response = await handleSafetyEventRequest(validPayload, {
    saveSafetyEvent: async () => ({ ok: false, reason: "write-failed" }),
  })

  assert.equal(response.status, 500)
  assert.deepEqual(response.body, {
    ok: false,
    reason: "write-failed",
  })
})