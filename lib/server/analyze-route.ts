import {
  analyze,
  type Category,
  type RequestType,
  type SafetyResult,
} from "../analyze.ts"
import { invokeBedrockExplanationModel } from "./bedrock-client.ts"
import {
  maybeAssistSafetyResultWithBedrock,
  type BedrockAssistPayload,
  type BedrockExplanationAssistOptions,
  type BedrockExplanationAssistResult,
} from "./bedrock-explanation.ts"

type EnvInput = Record<string, string | undefined>

type AnalyzeRouteOptions = {
  env?: EnvInput
  invokeBedrock?: BedrockExplanationAssistOptions["invoke"]
}

type AnalyzeRouteSuccess = {
  status: 200
  body: {
    ok: true
    result: SafetyResult
    bedrock: BedrockApiMetadata
  }
}

type BedrockApiMetadata = {
  used: boolean
  outcome: BedrockExplanationAssistResult["outcome"]
  invalidReason?: Extract<
    BedrockExplanationAssistResult,
    { outcome: "invalid_response" }
  >["invalidReason"]
}

type AnalyzeRouteError = {
  status: 400
  body: {
    ok: false
    reason: "invalid-payload"
  }
}

type AnalyzeRouteResponse = AnalyzeRouteSuccess | AnalyzeRouteError

const CATEGORIES: readonly Category[] = [
  "money",
  "message",
  "caller",
  "door",
  "online",
  "video",
  "other",
]

const REQUEST_TYPES: readonly RequestType[] = [
  "pay",
  "link",
  "code",
  "details",
  "callback",
  "install",
  "screen",
  "unsure",
]

export async function handleAnalyzeRequest(
  payload: unknown,
  options: AnalyzeRouteOptions = {},
): Promise<AnalyzeRouteResponse> {
  const input = parseAnalyzePayload(payload)

  if (!input) {
    return {
      status: 400,
      body: { ok: false, reason: "invalid-payload" },
    }
  }

  const result = analyze(input.message, input.category, input.requests)
  const bedrock = await maybeAssistSafetyResultWithBedrock(
    buildBedrockAssistPayload(input.message, input.category, input.requests, result),
    {
      env: options.env,
      invoke: options.invokeBedrock ?? invokeBedrockExplanationModel,
    },
  )

  return {
    status: 200,
    body: {
      ok: true,
      result: applyBedrockExplanation(result, bedrock),
      bedrock: buildBedrockApiMetadata(bedrock),
    },
  }
}

function parseAnalyzePayload(
  payload: unknown,
): { message: string; category: Category; requests: RequestType[] } | null {
  if (!isRecord(payload)) return null
  if (typeof payload.message !== "string") return null
  if (!isCategory(payload.category)) return null
  if (!isRequestArray(payload.requests)) return null

  const message = payload.message.trim()
  if (!message) return null

  return {
    message,
    category: payload.category,
    requests: payload.requests.length > 0 ? payload.requests : ["unsure"],
  }
}

function buildBedrockAssistPayload(
  message: string,
  category: Category,
  requests: RequestType[],
  result: SafetyResult,
): BedrockAssistPayload {
  return {
    category,
    requests,
    risk: result.risk,
    riskSignalIds: result.riskSignals.map((signal) => signal.id),
    sourceIds: result.sourceIds,
    saferStep: result.saferStep,
    doNotYet: result.doNotYet,
    why: result.why,
    verify: result.verify,
    situationSummary: message,
  }
}

function applyBedrockExplanation(
  result: SafetyResult,
  bedrock: BedrockExplanationAssistResult,
): SafetyResult {
  if (!bedrock.used) return result

  return {
    ...result,
    saferStep: bedrock.explanation.saferNextStep,
    why: bedrock.explanation.why,
    verify: bedrock.explanation.verificationSteps,
  }
}

function buildBedrockApiMetadata(
  bedrock: BedrockExplanationAssistResult,
): BedrockApiMetadata {
  if (bedrock.outcome === "invalid_response") {
    return {
      used: bedrock.used,
      outcome: bedrock.outcome,
      invalidReason: bedrock.invalidReason,
    }
  }

  return {
    used: bedrock.used,
    outcome: bedrock.outcome,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.includes(value as Category)
}

function isRequestArray(value: unknown): value is RequestType[] {
  return Array.isArray(value) && value.every((item) => REQUEST_TYPES.includes(item))
}
