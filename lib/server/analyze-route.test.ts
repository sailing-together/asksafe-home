import test from "node:test"
import assert from "node:assert/strict"

import { handleAnalyzeRequest } from "./analyze-route.ts"

const enabledEnv = {
  ENABLE_BEDROCK_EXPLANATION: "true",
  BEDROCK_MODEL_ID: "anthropic.claude-3-haiku-20240307-v1:0",
}

test("handleAnalyzeRequest rejects invalid payloads", async () => {
  const response = await handleAnalyzeRequest({
    message: "",
    category: "money",
    requests: ["pay"],
  })

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      reason: "invalid-payload",
    },
  })
})

test("handleAnalyzeRequest returns deterministic analysis when Bedrock is disabled", async () => {
  let invoked = false

  const response = await handleAnalyzeRequest(
    {
      message: "my daughter asks me to send 2000 AUD right now",
      category: "video",
      requests: ["pay"],
    },
    {
      env: {},
      invokeBedrock: async () => {
        invoked = true
        return "{}"
      },
    },
  )

  assert.equal(invoked, false)
  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
  assert.equal(response.body.result.risk, "high")
  assert.deepEqual(response.body.bedrock, {
    used: false,
    outcome: "disabled",
  })
})

test("handleAnalyzeRequest applies validated Bedrock wording without changing safety structure", async () => {
  const response = await handleAnalyzeRequest(
    {
      message: "my daughter asks me to send 2000 AUD right now",
      category: "video",
      requests: ["pay"],
    },
    {
      env: enabledEnv,
      invokeBedrock: async () =>
        JSON.stringify({
          saferNextStep:
            "Pause before paying and contact your daughter using a saved number.",
          why: "This has urgency and a request for money.",
          verificationSteps: [
            "Do not use contact details from the message.",
            "Call your daughter using a number you already trust.",
          ],
          trustedSupportSummary:
            "I received an urgent money request and want help checking it safely.",
        }),
    },
  )

  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
  assert.equal(response.body.result.risk, "high")
  assert.equal(response.body.result.headline, "This looks unsafe. It's good you paused.")
  assert.deepEqual(response.body.result.doNotYet, [
    "Don't send any money, gift cards, or bank details",
    "Don't click links or install anything they asked for",
    "Don't share passwords, PINs, or one-time codes",
    "Don't feel rushed — real organisations let you take your time",
  ])
  assert.equal(
    response.body.result.saferStep,
    "Pause before paying and contact your daughter using a saved number.",
  )
  assert.equal(response.body.result.why, "This has urgency and a request for money.")
  assert.deepEqual(response.body.result.verify, [
    "Do not use contact details from the message.",
    "Call your daughter using a number you already trust.",
  ])
  assert.deepEqual(response.body.bedrock, {
    used: true,
    outcome: "success",
  })
})

test("handleAnalyzeRequest falls back when Bedrock output is invalid", async () => {
  const response = await handleAnalyzeRequest(
    {
      message: "my daughter asks me to send 2000 AUD right now",
      category: "video",
      requests: ["pay"],
    },
    {
      env: enabledEnv,
      invokeBedrock: async () => "{not json",
    },
  )

  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
  assert.match(response.body.result.saferStep, /Stop here for now/)
  assert.deepEqual(response.body.bedrock, {
    used: false,
    outcome: "invalid_response",
    invalidReason: "invalid_json",
  })
})

test("handleAnalyzeRequest applies the first three Bedrock verification steps", async () => {
  const response = await handleAnalyzeRequest(
    {
      message: "my daughter asks me to send 2000 AUD right now",
      category: "video",
      requests: ["pay"],
    },
    {
      env: enabledEnv,
      invokeBedrock: async () =>
        JSON.stringify({
          saferNextStep: "Pause before paying.",
          why: "This involves money pressure.",
          verificationSteps: ["One", "Two", "Three", "Four"],
          trustedSupportSummary:
            "I received a money request and want help checking it safely.",
        }),
    },
  )

  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
  assert.deepEqual(response.body.bedrock, {
    used: true,
    outcome: "success",
  })
  assert.deepEqual(response.body.result.verify, ["One", "Two", "Three"])
})
