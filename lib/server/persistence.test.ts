import test from "node:test"
import assert from "node:assert/strict"
import {
  buildSafetyEventItem,
  saveFeedbackEvent,
  saveSafetyEvent,
  saveSupportEvent,
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


test("saveFeedbackEvent writes the DynamoDB feedback table key", async () => {
  let commandInput: Record<string, unknown> | undefined
  const documentClient = {
    send: async (command: { input: Record<string, unknown> }) => {
      commandInput = command.input
    },
  }

  const result = await saveFeedbackEvent(
    {
      eventId: "feedback-123",
      safetyEventId: "safety-event-123",
      helpful: true,
      reason: "clear-next-step",
      anonymousSessionId: "session-123",
      now: new Date("2026-06-19T02:00:00.000Z"),
    },
    {
      clientProvider: () => ({
        ok: true,
        config: {
          region: "ap-southeast-2",
          tables: {
            events: "events-table",
            feedback: "feedback-table",
            supportEvents: "support-events-table",
          },
        },
        documentClient: documentClient as never,
      }),
    },
  )

  assert.deepEqual(result, { ok: true, id: "feedback-123" })
  assert.equal(commandInput?.TableName, "feedback-table")
  assert.deepEqual(commandInput?.Item, {
    feedbackId: "feedback-123",
    eventId: "safety-event-123",
    helpful: true,
    reason: "clear-next-step",
    anonymousSessionId: "session-123",
    createdAt: "2026-06-19T02:00:00.000Z",
  })
})

test("saveSupportEvent writes the DynamoDB support event table key", async () => {
  let commandInput: Record<string, unknown> | undefined
  const documentClient = {
    send: async (command: { input: Record<string, unknown> }) => {
      commandInput = command.input
    },
  }

  const result = await saveSupportEvent(
    {
      eventId: "support-123",
      safetyEventId: "safety-event-123",
      action: "setup-opened",
      anonymousSessionId: "session-123",
      now: new Date("2026-06-19T02:05:00.000Z"),
    },
    {
      clientProvider: () => ({
        ok: true,
        config: {
          region: "ap-southeast-2",
          tables: {
            events: "events-table",
            feedback: "feedback-table",
            supportEvents: "support-events-table",
          },
        },
        documentClient: documentClient as never,
      }),
    },
  )

  assert.deepEqual(result, { ok: true, id: "support-123" })
  assert.equal(commandInput?.TableName, "support-events-table")
  assert.deepEqual(commandInput?.Item, {
    supportEventId: "support-123",
    eventId: "safety-event-123",
    action: "setup-opened",
    anonymousSessionId: "session-123",
    createdAt: "2026-06-19T02:05:00.000Z",
  })
})
