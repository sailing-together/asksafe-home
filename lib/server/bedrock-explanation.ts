import { getAskSafeBedrockEnv, type AskSafeBedrockEnvResult } from "./bedrock-env.ts"
import { BedrockInvocationTimeoutError } from "./bedrock-client.ts"
import {
  validateBedrockExplanationResponse,
  type BedrockExplanationValidationResult,
  type ValidatedBedrockExplanation,
} from "./bedrock-response-validation.ts"
import { redactSensitiveTextForBedrock } from "./bedrock-redaction.ts"
import {
  checkBedrockQuota,
  type BedrockQuotaBlockedOutcome,
  type BedrockQuotaDecision,
  type BedrockQuotaInput,
} from "./bedrock-quota.ts"

type EnvInput = Record<string, string | undefined>

export type BedrockAssistPayload = {
  category: string
  requests: readonly string[]
  risk: string
  riskSignalIds: readonly string[]
  sourceIds: readonly string[]
  saferStep: string
  doNotYet: readonly string[]
  why: string
  verify: readonly string[]
  situationSummary?: string
  clarification?: {
    question: string
    reason: string
    checks?: readonly string[]
  }
}

export type BedrockExplanationAssistResult =
  | {
      used: false
      outcome:
        | "disabled"
        | "missing-model-id"
        | "not_configured"
        | "runtime_error"
        | "timeout"
        | "invalid_response"
        | BedrockQuotaBlockedOutcome
      invalidReason?: Extract<
        BedrockExplanationValidationResult,
        { valid: false }
      >["reason"]
      invalidDetail?: Extract<
        BedrockExplanationValidationResult,
        { valid: false }
      >["detail"]
    }
  | {
      used: true
      outcome: "success"
      explanation: ValidatedBedrockExplanation
    }

export type BedrockExplanationAssistOptions = {
  env?: EnvInput
  quota?: BedrockQuotaInput & {
    check?: (input: BedrockQuotaInput) => Promise<BedrockQuotaDecision>
  }
  invoke?: (payload: {
    config: Extract<AskSafeBedrockEnvResult, { enabled: true }>["config"]
    promptPayload: BedrockAssistPayload
  }) => Promise<string>
}

export async function maybeAssistSafetyResultWithBedrock(
  payload: BedrockAssistPayload,
  options: BedrockExplanationAssistOptions = {},
): Promise<BedrockExplanationAssistResult> {
  const bedrockEnv = getAskSafeBedrockEnv(options.env)

  if (!bedrockEnv.enabled) {
    return {
      used: false,
      outcome: bedrockEnv.reason,
    }
  }

  if (!options.invoke) {
    return {
      used: false,
      outcome: "not_configured",
    }
  }

  const quotaInput: BedrockQuotaInput = {
    userTier: options.quota?.userTier,
    subjectId: options.quota?.subjectId,
  }
  if (options.quota?.now) quotaInput.now = options.quota.now
  const quotaDecision = options.quota?.check
    ? await options.quota.check(quotaInput)
    : await checkBedrockQuota(quotaInput, { env: options.env })

  if (!quotaDecision.allowed) {
    return {
      used: false,
      outcome: quotaDecision.outcome,
    }
  }

  const promptPayload = buildBedrockPromptPayload(
    payload,
    bedrockEnv.config.maxInputChars,
  )

  try {
    const responseText = await options.invoke({
      config: bedrockEnv.config,
      promptPayload,
    })

    const validation = validateBedrockExplanationResponse(responseText, promptPayload)
    if (!validation.valid) {
      const invalidResult: Extract<
        BedrockExplanationAssistResult,
        { used: false }
      > = {
        used: false,
        outcome: "invalid_response",
        invalidReason: validation.reason,
      }
      if (validation.detail) invalidResult.invalidDetail = validation.detail
      return invalidResult
    }

    return {
      used: true,
      outcome: "success",
      explanation: validation.explanation,
    }
  } catch (error) {
    if (error instanceof BedrockInvocationTimeoutError) {
      return {
        used: false,
        outcome: "timeout",
      }
    }

    return {
      used: false,
      outcome: "runtime_error",
    }
  }
}

function buildBedrockPromptPayload(
  payload: BedrockAssistPayload,
  maxInputChars: number,
): BedrockAssistPayload {
  if (!payload.situationSummary) return payload

  return {
    ...payload,
    situationSummary: redactSensitiveTextForBedrock(payload.situationSummary).slice(
      0,
      maxInputChars,
    ),
  }
}
