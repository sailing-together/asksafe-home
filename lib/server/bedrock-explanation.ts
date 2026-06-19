import { getAskSafeBedrockEnv, type AskSafeBedrockEnvResult } from "./bedrock-env.ts"
import { redactSensitiveTextForBedrock } from "./bedrock-redaction.ts"

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
}

export type BedrockExplanationAssistResult =
  | {
      used: false
      outcome: "disabled" | "missing-model-id" | "not_configured" | "runtime_error"
    }
  | {
      used: true
      outcome: "success"
    }

export type BedrockExplanationAssistOptions = {
  env?: EnvInput
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

  const promptPayload = buildBedrockPromptPayload(
    payload,
    bedrockEnv.config.maxInputChars,
  )

  try {
    await options.invoke({
      config: bedrockEnv.config,
      promptPayload,
    })
  } catch {
    return {
      used: false,
      outcome: "runtime_error",
    }
  }

  return {
    used: true,
    outcome: "success",
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
