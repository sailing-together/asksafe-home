import test from "node:test"
import assert from "node:assert/strict"

import {
  FEEDBACK_EVENT_SMOKE_PAYLOAD,
  SUPPORT_EVENT_SMOKE_PAYLOAD,
  evaluateOutcomeEventSmokeResponse,
} from "./outcome-event-smoke.ts"

test("outcome event smoke payloads avoid sensitive user content", () => {
  const combined = JSON.stringify([
    FEEDBACK_EVENT_SMOKE_PAYLOAD,
    SUPPORT_EVENT_SMOKE_PAYLOAD,
  ])

  assert.equal(combined.includes("password"), false)
  assert.equal(combined.includes("card"), false)
  assert.equal(combined.includes("rawMessage"), false)
  assert.equal(FEEDBACK_EVENT_SMOKE_PAYLOAD.helpful, true)
  assert.equal(SUPPORT_EVENT_SMOKE_PAYLOAD.action, "summary-shared")
})

test("evaluateOutcomeEventSmokeResponse accepts a persisted event response", () => {
  const result = evaluateOutcomeEventSmokeResponse(201, {
    ok: true,
    id: "feedback-123",
  })

  assert.deepEqual(result, {
    ok: true,
    persisted: true,
    id: "feedback-123",
  })
})

test("evaluateOutcomeEventSmokeResponse reports missing AWS config separately", () => {
  const result = evaluateOutcomeEventSmokeResponse(202, {
    skipped: true,
    reason: "missing-aws-config",
  })

  assert.deepEqual(result, {
    ok: false,
    persisted: false,
    reason: "missing-aws-config",
  })
})

test("evaluateOutcomeEventSmokeResponse rejects malformed event responses", () => {
  const result = evaluateOutcomeEventSmokeResponse(200, {
    ok: true,
  })

  assert.deepEqual(result, {
    ok: false,
    persisted: false,
    reason: "malformed-response",
    status: 200,
  })
})
