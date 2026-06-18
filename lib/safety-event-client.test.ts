import test from "node:test"
import assert from "node:assert/strict"
import {
  buildSafetyEventPayload,
  recordSafetyEvent,
  type SafetyEventRecordInput,
} from "./safety-event-client.ts"

const input: SafetyEventRecordInput & { rawMessage?: string } = {
  category: "message",
  requests: ["link", "details"],
  result: {
    risk: "high",
    headline: "This looks unsafe.",
    saferStep: "Stop here for now.",
    doNotYet: ["Don't click the link"],
    why: "It asks for details.",
    verify: ["Use official contact details"],
    riskSignals: [
      { id: "link-request", label: "asking you to use a link", severity: "caution" },
      { id: "personal-details", label: "asking for personal details", severity: "high" },
    ],
    scamTypeIds: ["phishing-message"],
    sourceIds: ["scamwatch"],
  },
  anonymousSessionId: "session-123",
  rawMessage: "My private bank password is secret",
}

test("buildSafetyEventPayload keeps only sanitized safety metadata", () => {
  const payload = buildSafetyEventPayload(input)

  assert.deepEqual(payload, {
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
  })
  assert.equal(JSON.stringify(payload).includes("password"), false)
  assert.equal(JSON.stringify(payload).includes("This looks unsafe"), false)
})

test("recordSafetyEvent posts sanitized metadata to the safety events API", async () => {
  let requestUrl = ""
  let requestInit: RequestInit | undefined
  const fetchImpl: typeof fetch = async (url, init) => {
    requestUrl = String(url)
    requestInit = init
    return new Response(JSON.stringify({ ok: true, id: "event-123" }), { status: 201 })
  }

  const result = await recordSafetyEvent(input, { fetch: fetchImpl })

  assert.deepEqual(result, { ok: true })
  assert.equal(requestUrl, "/api/safety-events")
  assert.equal(requestInit?.method, "POST")
  assert.equal(requestInit?.headers && (requestInit.headers as Record<string, string>)["Content-Type"], "application/json")
  assert.equal(typeof requestInit?.body, "string")
  assert.equal(String(requestInit?.body).includes("password"), false)
  assert.deepEqual(JSON.parse(String(requestInit?.body)), buildSafetyEventPayload(input))
})

test("recordSafetyEvent fails softly when the API request fails", async () => {
  const result = await recordSafetyEvent(input, {
    fetch: async () => new Response(JSON.stringify({ ok: false }), { status: 500 }),
  })

  assert.deepEqual(result, { ok: false })
})

test("recordSafetyEvent fails softly when fetch throws", async () => {
  const result = await recordSafetyEvent(input, {
    fetch: async () => {
      throw new Error("network down")
    },
  })

  assert.deepEqual(result, { ok: false })
})