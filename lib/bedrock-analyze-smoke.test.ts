import test from "node:test"
import assert from "node:assert/strict"

import {
  BEDROCK_ANALYZE_SMOKE_PAYLOAD,
  evaluateBedrockAnalyzeSmokeResponse,
} from "./bedrock-analyze-smoke.ts"
import { analyze } from "./analyze.ts"

const deterministicResult = analyze(
  BEDROCK_ANALYZE_SMOKE_PAYLOAD.message,
  BEDROCK_ANALYZE_SMOKE_PAYLOAD.category,
  BEDROCK_ANALYZE_SMOKE_PAYLOAD.requests,
)

test("evaluateBedrockAnalyzeSmokeResponse accepts a healthy deterministic analyze response", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse({
    ok: true,
    result: deterministicResult,
    bedrock: {
      used: false,
      outcome: "disabled",
    },
  })

  assert.deepEqual(result, {
    ok: true,
    bedrockUsed: false,
    bedrockOutcome: "disabled",
    risk: "high",
  })
})

test("evaluateBedrockAnalyzeSmokeResponse requires Bedrock success when requested", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse(
    {
      ok: true,
      result: deterministicResult,
      bedrock: {
        used: false,
        outcome: "disabled",
      },
    },
    { expectBedrock: true },
  )

  assert.deepEqual(result, {
    ok: false,
    reason: "bedrock-not-used",
    bedrockUsed: false,
    bedrockOutcome: "disabled",
  })
})

test("evaluateBedrockAnalyzeSmokeResponse includes Bedrock invalid response diagnostics", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse(
    {
      ok: true,
      result: deterministicResult,
      bedrock: {
        used: false,
        outcome: "invalid_response",
        invalidReason: "invalid_shape",
        invalidDetail: "too_many_verification_steps",
      },
    },
    { expectBedrock: true },
  )

  assert.deepEqual(result, {
    ok: false,
    reason: "bedrock-not-used",
    bedrockUsed: false,
    bedrockOutcome: "invalid_response",
    bedrockInvalidReason: "invalid_shape",
    bedrockInvalidDetail: "too_many_verification_steps",
  })
})

test("evaluateBedrockAnalyzeSmokeResponse accepts Bedrock success when requested", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse(
    {
      ok: true,
      result: {
        ...deterministicResult,
        why: "This is a safer Bedrock-polished explanation.",
      },
      bedrock: {
        used: true,
        outcome: "success",
      },
    },
    { expectBedrock: true },
  )

  assert.deepEqual(result, {
    ok: true,
    bedrockUsed: true,
    bedrockOutcome: "success",
    risk: "high",
  })
})

test("evaluateBedrockAnalyzeSmokeResponse accepts an expected quota hard stop", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse(
    {
      ok: true,
      result: deterministicResult,
      bedrock: {
        used: false,
        outcome: "quota_user_daily_limit",
      },
    },
    { expectBedrockOutcome: "quota_user_daily_limit" },
  )

  assert.deepEqual(result, {
    ok: true,
    bedrockUsed: false,
    bedrockOutcome: "quota_user_daily_limit",
    risk: "high",
  })
})

test("evaluateBedrockAnalyzeSmokeResponse rejects an unexpected Bedrock outcome", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse(
    {
      ok: true,
      result: deterministicResult,
      bedrock: {
        used: true,
        outcome: "success",
      },
    },
    { expectBedrockOutcome: "quota_user_daily_limit" },
  )

  assert.deepEqual(result, {
    ok: false,
    reason: "unexpected-bedrock-outcome",
    bedrockUsed: true,
    bedrockOutcome: "success",
    expectedBedrockOutcome: "quota_user_daily_limit",
  })
})

test("evaluateBedrockAnalyzeSmokeResponse rejects malformed analyze responses", () => {
  const result = evaluateBedrockAnalyzeSmokeResponse({
    ok: true,
    bedrock: {
      used: true,
      outcome: "success",
    },
  })

  assert.deepEqual(result, {
    ok: false,
    reason: "malformed-response",
  })
})
