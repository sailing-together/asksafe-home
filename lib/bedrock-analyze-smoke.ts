import type { Category, RequestType, RiskLevel } from "./analyze.ts"

export const BEDROCK_ANALYZE_SMOKE_PAYLOAD: {
  message: string
  category: Category
  requests: RequestType[]
} = {
  message:
    "A video caller claiming to be my daughter asked me to send 2000 AUD today.",
  category: "video",
  requests: ["pay"],
}

type BedrockAnalyzeSmokeOptions = {
  expectBedrock?: boolean
  expectBedrockOutcome?: string
}

type BedrockAnalyzeSmokeSuccess = {
  ok: true
  bedrockUsed: boolean
  bedrockOutcome: string
  risk: RiskLevel
}

type BedrockAnalyzeSmokeFailure =
  | {
      ok: false
      reason: "malformed-response"
    }
  | {
      ok: false
      reason: "unexpected-risk"
      risk: string
    }
  | {
      ok: false
      reason: "bedrock-not-used"
      bedrockUsed: boolean
      bedrockOutcome: string
      bedrockInvalidReason?: string
      bedrockInvalidDetail?: string
    }
  | {
      ok: false
      reason: "unexpected-bedrock-outcome"
      bedrockUsed: boolean
      bedrockOutcome: string
      expectedBedrockOutcome: string
    }

export type BedrockAnalyzeSmokeEvaluation =
  | BedrockAnalyzeSmokeSuccess
  | BedrockAnalyzeSmokeFailure

export function evaluateBedrockAnalyzeSmokeResponse(
  body: unknown,
  options: BedrockAnalyzeSmokeOptions = {},
): BedrockAnalyzeSmokeEvaluation {
  if (!isRecord(body) || body.ok !== true) {
    return { ok: false, reason: "malformed-response" }
  }

  const result = body.result
  const bedrock = body.bedrock

  if (!isRecord(result) || !isRecord(bedrock)) {
    return { ok: false, reason: "malformed-response" }
  }

  if (!isRiskLevel(result.risk)) {
    return { ok: false, reason: "malformed-response" }
  }

  if (result.risk !== "high") {
    return {
      ok: false,
      reason: "unexpected-risk",
      risk: result.risk,
    }
  }

  if (typeof bedrock.used !== "boolean" || typeof bedrock.outcome !== "string") {
    return { ok: false, reason: "malformed-response" }
  }

  if (
    options.expectBedrockOutcome &&
    bedrock.outcome !== options.expectBedrockOutcome
  ) {
    return {
      ok: false,
      reason: "unexpected-bedrock-outcome",
      bedrockUsed: bedrock.used,
      bedrockOutcome: bedrock.outcome,
      expectedBedrockOutcome: options.expectBedrockOutcome,
    }
  }

  if (options.expectBedrock && !(bedrock.used && bedrock.outcome === "success")) {
    const failure: BedrockAnalyzeSmokeFailure = {
      ok: false,
      reason: "bedrock-not-used",
      bedrockUsed: bedrock.used,
      bedrockOutcome: bedrock.outcome,
    }
    if (typeof bedrock.invalidReason === "string") {
      failure.bedrockInvalidReason = bedrock.invalidReason
    }
    if (typeof bedrock.invalidDetail === "string") {
      failure.bedrockInvalidDetail = bedrock.invalidDetail
    }
    return failure
  }

  return {
    ok: true,
    bedrockUsed: bedrock.used,
    bedrockOutcome: bedrock.outcome,
    risk: result.risk,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "low" || value === "caution" || value === "high"
}
