import test from "node:test"
import assert from "node:assert/strict"
import {
  buildSafetyEventItem,
  saveSafetyEvent,
  type SafetyEventInput,
} from "./persistence.ts"

test("buildSafetyEventItem excludes raw message text", () => {
  const input: SafetyEventInput = {
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
    rawMessage: "My bank password is secret",
    anonymousSessionId: "session-123",
    now: new Date("2026-06-17T09:00:00.000Z"),
    eventId: "event-123",
  }

  const item = buildSafetyEventItem(input)

  assert.equal(item.eventId, "event-123")
  assert.equal(item.category, "message")
  assert.deepEqual(item.requests, ["link", "details"])
  assert.equal(item.riskLevel, "high")
  assert.equal(item.anonymousSessionId, "session-123")
  assert.equal(item.createdAt, "2026-06-17T09:00:00.000Z")
  assert.equal("rawMessage" in item, false)
  assert.equal(JSON.stringify(item).includes("password"), false)
})

test("saveSafetyEvent returns skipped when runtime config is missing", async () => {
  const result = await saveSafetyEvent(
    {
      category: "message",
      requests: ["link"],
      result: {
        risk: "caution",
        riskSignals: [],
        scamTypeIds: [],
        sourceIds: [],
      },
      now: new Date("2026-06-17T09:00:00.000Z"),
      eventId: "event-456",
    },
    {
      clientProvider: () => ({ ok: false, missing: ["ASKSAFE_EVENTS_TABLE"] }),
    },
  )

  assert.deepEqual(result, {
    skipped: true,
    reason: "missing-aws-config",
    missing: ["ASKSAFE_EVENTS_TABLE"],
  })
})
