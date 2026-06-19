import test from "node:test"
import assert from "node:assert/strict"
import {
  getAskSafeBedrockEnv,
  getDefaultAskSafeBedrockConfig,
} from "./bedrock-env.ts"

test("getAskSafeBedrockEnv is disabled by default", () => {
  const result = getAskSafeBedrockEnv({})

  assert.equal(result.enabled, false)
  assert.equal(result.reason, "disabled")
  assert.deepEqual(result.config, getDefaultAskSafeBedrockConfig())
})

test("getAskSafeBedrockEnv stays disabled unless flag is exactly true", () => {
  const result = getAskSafeBedrockEnv({
    ENABLE_BEDROCK_EXPLANATION: "yes",
    BEDROCK_MODEL_ID: "anthropic.claude-3-haiku-20240307-v1:0",
  })

  assert.equal(result.enabled, false)
  assert.equal(result.reason, "disabled")
})

test("getAskSafeBedrockEnv reports missing model id when enabled", () => {
  const result = getAskSafeBedrockEnv({
    ENABLE_BEDROCK_EXPLANATION: "true",
  })

  assert.equal(result.enabled, false)
  assert.equal(result.reason, "missing-model-id")
})

test("getAskSafeBedrockEnv returns bounded enabled config", () => {
  const result = getAskSafeBedrockEnv({
    ENABLE_BEDROCK_EXPLANATION: "true",
    BEDROCK_MODEL_ID: "anthropic.claude-3-haiku-20240307-v1:0",
    BEDROCK_MAX_INPUT_CHARS: "2500",
    BEDROCK_MAX_OUTPUT_TOKENS: "900",
    BEDROCK_TIMEOUT_MS: "12000",
  })

  assert.equal(result.enabled, true)
  assert.equal(result.config.modelId, "anthropic.claude-3-haiku-20240307-v1:0")
  assert.equal(result.config.maxInputChars, 1800)
  assert.equal(result.config.maxOutputTokens, 500)
  assert.equal(result.config.timeoutMs, 4500)
})
