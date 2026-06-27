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
  invalidReason?: NonNullable<
    Extract<BedrockExplanationAssistResult, { used: false }>["invalidReason"]
  >
  invalidDetail?: NonNullable<
    Extract<BedrockExplanationAssistResult, { used: false }>["invalidDetail"]
  >
}

type AnalyzeRouteError =
  | {
      status: 400
      body: {
        ok: false
        reason: "invalid-payload"
      }
    }
  | {
      status: 413
      body: {
        ok: false
        reason: "message-too-long"
        maxMessageChars: number
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

const DEFAULT_MAX_ANALYZE_MESSAGE_CHARS = 1800

export async function handleAnalyzeRequest(
  payload: unknown,
  options: AnalyzeRouteOptions = {},
): Promise<AnalyzeRouteResponse> {
  const input = parseAnalyzePayload(payload, options.env)

  if (!input.ok) {
    if (input.reason === "message-too-long") {
      return {
        status: 413,
        body: {
          ok: false,
          reason: "message-too-long",
          maxMessageChars: input.maxMessageChars,
        },
      }
    }

    return {
      status: 400,
      body: { ok: false, reason: "invalid-payload" },
    }
  }

  const analyzeInput = input.value

  const result = analyze(analyzeInput.message, analyzeInput.category, analyzeInput.requests)
  const bedrock = await maybeAssistSafetyResultWithBedrock(
    buildBedrockAssistPayload(
      analyzeInput.message,
      analyzeInput.category,
      analyzeInput.requests,
      result,
    ),
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
  env: EnvInput = process.env,
):
  | {
      ok: true
      value: { message: string; category: Category; requests: RequestType[] }
    }
  | { ok: false; reason: "invalid-payload" }
  | { ok: false; reason: "message-too-long"; maxMessageChars: number } {
  if (!isRecord(payload)) return { ok: false, reason: "invalid-payload" }
  if (typeof payload.message !== "string") return { ok: false, reason: "invalid-payload" }
  if (!isCategory(payload.category)) return { ok: false, reason: "invalid-payload" }
  if (!isRequestArray(payload.requests)) return { ok: false, reason: "invalid-payload" }

  const message = payload.message.trim()
  if (!message) return { ok: false, reason: "invalid-payload" }

  const maxMessageChars = readBoundedPositiveInteger(
    env,
    "ANALYZE_MAX_MESSAGE_CHARS",
    DEFAULT_MAX_ANALYZE_MESSAGE_CHARS,
  )
  if (message.length > maxMessageChars) {
    return { ok: false, reason: "message-too-long", maxMessageChars }
  }

  return {
    ok: true,
    value: {
      message,
      category: payload.category,
      requests: payload.requests.length > 0 ? payload.requests : ["unsure"],
    },
  }
}

function readBoundedPositiveInteger(
  env: EnvInput,
  name: string,
  maximum: number,
): number {
  const raw = env[name]?.trim() ?? ""
  if (!raw) return maximum

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return maximum

  return Math.min(parsed, maximum)
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
    clarification: result.clarification
      ? {
          question: result.clarification.question,
          reason: result.clarification.reason,
          checks: result.clarification.checks,
        }
      : undefined,
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
    const metadata: BedrockApiMetadata = {
      used: bedrock.used,
      outcome: bedrock.outcome,
      invalidReason: bedrock.invalidReason,
    }
    if (bedrock.invalidDetail) metadata.invalidDetail = bedrock.invalidDetail
    return metadata
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
