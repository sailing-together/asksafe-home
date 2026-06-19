import test from "node:test"
import assert from "node:assert/strict"
import { maybeAssistSafetyResultWithBedrock } from "./bedrock-explanation.ts"

const basePayload = {
  category: "money",
  requests: ["pay"],
  risk: "high",
  riskSignalIds: ["urgent-pressure"],
  sourceIds: ["scamwatch-stop-check-protect"],
  saferStep: "Pause before paying.",
  doNotYet: ["Do not send money yet."],
  why: "This includes payment pressure.",
  verify: ["Contact the person using a saved number."],
  situationSummary: "My daughter asks for money and gave me code 123456.",
} as const

test("maybeAssistSafetyResultWithBedrock does not invoke Bedrock when disabled", async () => {
  let invoked = false

  const result = await maybeAssistSafetyResultWithBedrock(basePayload, {
    env: {},
    invoke: async () => {
      invoked = true
      return "{}"
    },
  })

  assert.equal(invoked, false)
  assert.deepEqual(result, {
    used: false,
    outcome: "disabled",
  })
})

test("maybeAssistSafetyResultWithBedrock falls back when enabled without invoker", async () => {
  const result = await maybeAssistSafetyResultWithBedrock(basePayload, {
    env: {
      ENABLE_BEDROCK_EXPLANATION: "true",
      BEDROCK_MODEL_ID: "anthropic.claude-3-haiku-20240307-v1:0",
    },
  })

  assert.deepEqual(result, {
    used: false,
    outcome: "not_configured",
  })
})

test("maybeAssistSafetyResultWithBedrock falls back when invocation fails", async () => {
  const result = await maybeAssistSafetyResultWithBedrock(basePayload, {
    env: {
      ENABLE_BEDROCK_EXPLANATION: "true",
      BEDROCK_MODEL_ID: "anthropic.claude-3-haiku-20240307-v1:0",
    },
    invoke: async () => {
      throw new Error("bedrock unavailable")
    },
  })

  assert.deepEqual(result, {
    used: false,
    outcome: "runtime_error",
  })
})
