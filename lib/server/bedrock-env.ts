type EnvInput = Record<string, string | undefined>

export type AskSafeBedrockConfig = {
  modelId: string
  maxInputChars: number
  maxOutputTokens: number
  timeoutMs: number
}

export type AskSafeBedrockEnvResult =
  | {
      enabled: true
      config: AskSafeBedrockConfig
    }
  | {
      enabled: false
      reason: "disabled" | "missing-model-id"
      config: AskSafeBedrockConfig
    }

const DEFAULT_CONFIG: AskSafeBedrockConfig = {
  modelId: "",
  maxInputChars: 1800,
  maxOutputTokens: 500,
  timeoutMs: 4500,
}

export function getDefaultAskSafeBedrockConfig(): AskSafeBedrockConfig {
  return { ...DEFAULT_CONFIG }
}

export function getAskSafeBedrockEnv(
  env: EnvInput = process.env,
): AskSafeBedrockEnvResult {
  const config: AskSafeBedrockConfig = {
    modelId: readEnv(env, "BEDROCK_MODEL_ID"),
    maxInputChars: readBoundedPositiveInteger(
      env,
      "BEDROCK_MAX_INPUT_CHARS",
      DEFAULT_CONFIG.maxInputChars,
    ),
    maxOutputTokens: readBoundedPositiveInteger(
      env,
      "BEDROCK_MAX_OUTPUT_TOKENS",
      DEFAULT_CONFIG.maxOutputTokens,
    ),
    timeoutMs: readBoundedPositiveInteger(
      env,
      "BEDROCK_TIMEOUT_MS",
      DEFAULT_CONFIG.timeoutMs,
    ),
  }

  if (readEnv(env, "ENABLE_BEDROCK_EXPLANATION") !== "true") {
    return {
      enabled: false,
      reason: "disabled",
      config,
    }
  }

  if (!config.modelId) {
    return {
      enabled: false,
      reason: "missing-model-id",
      config,
    }
  }

  return {
    enabled: true,
    config,
  }
}

function readEnv(env: EnvInput, name: string): string {
  return env[name]?.trim() ?? ""
}

function readBoundedPositiveInteger(
  env: EnvInput,
  name: string,
  maximum: number,
): number {
  const raw = readEnv(env, name)
  if (!raw) return maximum

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return maximum

  return Math.min(parsed, maximum)
}
