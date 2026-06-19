import test from "node:test"
import assert from "node:assert/strict"

import { invokeBedrockExplanationModel } from "./bedrock-client.ts"
import type { AskSafeBedrockConfig } from "./bedrock-env.ts"
import type { BedrockAssistPayload } from "./bedrock-explanation.ts"

const config: AskSafeBedrockConfig = {
  modelId: "anthropic.claude-3-haiku-20240307-v1:0",
  maxInputChars: 1800,
  maxOutputTokens: 123,
  timeoutMs: 4500,
}

const payload: BedrockAssistPayload = {
  category: "money",
  requests: ["pay"],
  risk: "high",
  riskSignalIds: ["urgent-pressure"],
  sourceIds: ["scamwatch-stop-check-protect"],
  saferStep: "Pause before paying.",
  doNotYet: ["Do not send money yet."],
  why: "This includes payment pressure.",
  verify: ["Call the person back using a saved number."],
  situationSummary: "A family member asked for money urgently.",
}

test("invokeBedrockExplanationModel sends a bounded JSON request", async () => {
  const calls: Array<{ command: unknown; options: unknown }> = []
  const client = {
    send: async (command: unknown, options: unknown) => {
      calls.push({ command, options })
      return {
        body: new TextEncoder().encode(
          JSON.stringify({
            content: [{ text: "{\"why\":\"Clearer wording\"}" }],
          }),
        ),
      }
    },
  }

  const result = await invokeBedrockExplanationModel({
    config,
    promptPayload: payload,
    client,
  })

  assert.equal(result, "{\"why\":\"Clearer wording\"}")
  assert.equal(calls.length, 1)

  const commandInput = (calls[0]?.command as { input?: Record<string, unknown> }).input
  assert.equal(commandInput?.modelId, config.modelId)
  assert.equal(commandInput?.contentType, "application/json")
  assert.equal(commandInput?.accept, "application/json")

  const requestBody = JSON.parse(new TextDecoder().decode(commandInput?.body as Uint8Array))
  assert.equal(requestBody.max_tokens, config.maxOutputTokens)
  assert.equal(requestBody.temperature, 0)
  assert.match(requestBody.messages[0].content, /Do not decide whether the situation is real or fake/)
  assert.match(requestBody.messages[0].content, /urgent-pressure/)

  const sendOptions = calls[0]?.options as { abortSignal?: AbortSignal }
  assert.ok(sendOptions.abortSignal)
})

test("invokeBedrockExplanationModel times out a slow model call", async () => {
  const client = {
    send: async (): Promise<{ body?: Uint8Array | string }> =>
      new Promise(() => undefined),
  }

  await assert.rejects(
    () =>
      invokeBedrockExplanationModel({
        config: { ...config, timeoutMs: 1 },
        promptPayload: payload,
        client,
      }),
    /bedrock-timeout/,
  )
})
