type EnvInput = Record<string, string | undefined>

export type AskSafeAwsTableConfig = {
  events: string
  feedback: string
  supportEvents: string
  users?: string
  households?: string
}

export type AskSafeAwsConfig = {
  region: string
  tables: AskSafeAwsTableConfig
}

export type AskSafeAwsEnvResult =
  | { ok: true; config: AskSafeAwsConfig }
  | { ok: false; missing: string[] }

const REQUIRED_ENV_NAMES = [
  "AWS_REGION",
  "ASKSAFE_EVENTS_TABLE",
  "ASKSAFE_FEEDBACK_TABLE",
  "ASKSAFE_SUPPORT_EVENTS_TABLE",
] as const

export function getRequiredAskSafeAwsEnvNames(): string[] {
  return [...REQUIRED_ENV_NAMES]
}

export function getAskSafeAwsEnv(env: EnvInput = process.env): AskSafeAwsEnvResult {
  const missing = REQUIRED_ENV_NAMES.filter((name) => !readEnv(env, name))

  if (missing.length > 0) {
    return { ok: false, missing }
  }

  return {
    ok: true,
    config: {
      region: readEnv(env, "AWS_REGION"),
      tables: {
        events: readEnv(env, "ASKSAFE_EVENTS_TABLE"),
        feedback: readEnv(env, "ASKSAFE_FEEDBACK_TABLE"),
        supportEvents: readEnv(env, "ASKSAFE_SUPPORT_EVENTS_TABLE"),
        users: readOptionalEnv(env, "ASKSAFE_USERS_TABLE"),
        households: readOptionalEnv(env, "ASKSAFE_HOUSEHOLDS_TABLE"),
      },
    },
  }
}

function readEnv(env: EnvInput, name: string): string {
  return env[name]?.trim() ?? ""
}

function readOptionalEnv(env: EnvInput, name: string): string | undefined {
  const value = readEnv(env, name)
  return value.length > 0 ? value : undefined
}
