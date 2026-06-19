import test from "node:test"
import assert from "node:assert/strict"

import { analyze } from "./analyze.ts"
import { analyzeSafetyWithFallback } from "./analyze-client.ts"

test("analyzeSafetyWithFallback posts to the analyze API and returns server result", async () => {
  const serverResult = analyze("Your parcel is waiting. Pay a fee now.", "message", [
    "link",
    "pay",
  ])
  const calls: Array<{ url: string; init?: RequestInit }> = []

  const result = await analyzeSafetyWithFallback(
    {
      message: "Your parcel is waiting. Pay a fee now.",
      category: "message",
      requests: ["link", "pay"],
    },
    {
      fetch: async (url, init) => {
        calls.push({ url: String(url), init })
        return new Response(
          JSON.stringify({
            ok: true,
            result: {
              ...serverResult,
              saferStep: "Server checked this safely.",
            },
            bedrock: {
              used: false,
              outcome: "disabled",
            },
          }),
          { status: 200 },
        )
      },
    },
  )

  assert.equal(result.saferStep, "Server checked this safely.")
  assert.equal(calls.length, 1)
  assert.equal(calls[0]?.url, "/api/analyze")
  assert.equal(calls[0]?.init?.method, "POST")
  assert.equal(
    calls[0]?.init?.headers &&
      (calls[0].init.headers as Record<string, string>)["Content-Type"],
    "application/json",
  )
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
    message: "Your parcel is waiting. Pay a fee now.",
    category: "message",
    requests: ["link", "pay"],
  })
})

test("analyzeSafetyWithFallback uses local analysis when the API fails", async () => {
  const result = await analyzeSafetyWithFallback(
    {
      message: "my daughter asks me to send 2000 AUD right now",
      category: "video",
      requests: ["pay"],
    },
    {
      fetch: async () => new Response(JSON.stringify({ ok: false }), { status: 500 }),
    },
  )

  const localResult = analyze(
    "my daughter asks me to send 2000 AUD right now",
    "video",
    ["pay"],
  )

  assert.deepEqual(result, localResult)
})

test("analyzeSafetyWithFallback uses local analysis when fetch throws", async () => {
  const result = await analyzeSafetyWithFallback(
    {
      message: "I was asked to share a one-time code",
      category: "message",
      requests: ["code"],
    },
    {
      fetch: async () => {
        throw new Error("network down")
      },
    },
  )

  assert.deepEqual(
    result,
    analyze("I was asked to share a one-time code", "message", ["code"]),
  )
})

test("analyzeSafetyWithFallback uses local analysis when the API is too slow", async () => {
  const result = await analyzeSafetyWithFallback(
    {
      message: "I was asked to send money right now",
      category: "money",
      requests: ["pay"],
    },
    {
      apiTimeoutMs: 1,
      fetch: async () => new Promise(() => undefined),
    },
  )

  assert.deepEqual(
    result,
    analyze("I was asked to send money right now", "money", ["pay"]),
  )
})

test("analyzeSafetyWithFallback uses local analysis for malformed API responses", async () => {
  const result = await analyzeSafetyWithFallback(
    {
      message: "I was asked to install an app",
      category: "caller",
      requests: ["install"],
    },
    {
      fetch: async () =>
        new Response(JSON.stringify({ ok: true, bedrock: { used: true } }), {
          status: 200,
        }),
    },
  )

  assert.deepEqual(
    result,
    analyze("I was asked to install an app", "caller", ["install"]),
  )
})
