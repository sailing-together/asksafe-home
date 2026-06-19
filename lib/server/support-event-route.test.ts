import test from "node:test"
import assert from "node:assert/strict"
import { handleSupportEventRequest } from "./support-event-route.ts"
import type { SaveSupportEventFn } from "./support-event-route.ts"

const validPayload = {
  safetyEventId: "safety-event-123",
  action: "summary-shared",
  anonymousSessionId: "session-123",
}

test("handleSupportEventRequest saves a valid support event", async () => {
  let savedInput: Parameters<SaveSupportEventFn>[0] | undefined
  const saveSupportEvent: SaveSupportEventFn = async (input) => {
    savedInput = input
    return { ok: true, id: "support-123" }
  }

  const response = await handleSupportEventRequest(validPayload, { saveSupportEvent })

  assert.equal(response.status, 201)
  assert.deepEqual(response.body, { ok: true, id: "support-123" })
  assert.deepEqual(savedInput, validPayload)
})

test("handleSupportEventRequest drops trusted contact details before saving", async () => {
  let savedInput: Parameters<SaveSupportEventFn>[0] | undefined
  const saveSupportEvent: SaveSupportEventFn = async (input) => {
    savedInput = input
    return { ok: true, id: "support-private" }
  }

  await handleSupportEventRequest(
    {
      ...validPayload,
      trustedEmail: "sarah@example.com",
      trustedPhone: "0400000000",
      rawMessage: "private family detail",
    },
    { saveSupportEvent },
  )

  assert.equal(savedInput && "trustedEmail" in savedInput, false)
  assert.equal(savedInput && "trustedPhone" in savedInput, false)
  assert.equal(JSON.stringify(savedInput).includes("private family detail"), false)
})

test("handleSupportEventRequest rejects unknown support actions", async () => {
  const response = await handleSupportEventRequest(
    { action: "auto-alert-family" },
    { saveSupportEvent: async () => ({ ok: true, id: "should-not-save" }) },
  )

  assert.equal(response.status, 400)
  assert.deepEqual(response.body, { ok: false, reason: "invalid-payload" })
})

test("handleSupportEventRequest reports skipped persistence when AWS config is missing", async () => {
  const response = await handleSupportEventRequest(validPayload, {
    saveSupportEvent: async () => ({
      skipped: true,
      reason: "missing-aws-config",
      missing: ["ASKSAFE_SUPPORT_EVENTS_TABLE"],
    }),
  })

  assert.equal(response.status, 202)
  assert.deepEqual(response.body, { skipped: true, reason: "missing-aws-config" })
})

test("handleSupportEventRequest maps write failures to a generic server error", async () => {
  const response = await handleSupportEventRequest(validPayload, {
    saveSupportEvent: async () => ({ ok: false, reason: "write-failed" }),
  })

  assert.equal(response.status, 500)
  assert.deepEqual(response.body, { ok: false, reason: "write-failed" })
})
