import { TransactWriteCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

import { getAskSafeAwsEnv, type AskSafeAwsConfig } from "./aws-env.ts"

type EnvInput = Record<string, string | undefined>

export type BedrockQuotaUserTier = "anonymous" | "registered"

export type BedrockQuotaInput = {
  userTier?: BedrockQuotaUserTier
  subjectId?: string
  now?: Date
}

export type BedrockQuotaConfig = {
  enabled: boolean
  globalDailyCallLimit: number
  globalMonthlyCallLimit: number
  anonymousDailyCallLimit: number
  registeredDailyCallLimit: number
}

export type BedrockQuotaKeys = {
  globalDailyKey: string
  globalMonthlyKey: string
  userDailyKey: string
}

export type BedrockQuotaAllowed = {
  allowed: true
}

export type BedrockQuotaBlocked = {
  allowed: false
  outcome: BedrockQuotaBlockedOutcome
}

export type BedrockQuotaBlockedOutcome =
  | "quota_not_configured"
  | "quota_runtime_error"
  | "quota_global_daily_limit"
  | "quota_global_monthly_limit"
  | "quota_user_daily_limit"

export type BedrockQuotaDecision = BedrockQuotaAllowed | BedrockQuotaBlocked

type AskSafeDynamoClientResult =
  | {
      ok: true
      config: AskSafeAwsConfig
      documentClient: DynamoDBDocumentClient
    }
  | {
      ok: false
      missing: string[]
    }

type QuotaClientProvider = () =>
  | AskSafeDynamoClientResult
  | Promise<AskSafeDynamoClientResult>

export type CheckBedrockQuotaOptions = {
  env?: EnvInput
  clientProvider?: QuotaClientProvider
}

const DEFAULT_QUOTA_CONFIG: Omit<BedrockQuotaConfig, "enabled"> = {
  globalDailyCallLimit: 100,
  globalMonthlyCallLimit: 1000,
  anonymousDailyCallLimit: 3,
  registeredDailyCallLimit: 20,
}

export function getBedrockQuotaConfig(env: EnvInput = process.env): BedrockQuotaConfig {
  return {
    enabled: readEnv(env, "ENABLE_BEDROCK_QUOTA") === "true",
    globalDailyCallLimit: readBoundedPositiveInteger(
      env,
      "BEDROCK_GLOBAL_DAILY_CALL_LIMIT",
      DEFAULT_QUOTA_CONFIG.globalDailyCallLimit,
    ),
    globalMonthlyCallLimit: readBoundedPositiveInteger(
      env,
      "BEDROCK_GLOBAL_MONTHLY_CALL_LIMIT",
      DEFAULT_QUOTA_CONFIG.globalMonthlyCallLimit,
    ),
    anonymousDailyCallLimit: readBoundedPositiveInteger(
      env,
      "BEDROCK_ANONYMOUS_DAILY_CALL_LIMIT",
      DEFAULT_QUOTA_CONFIG.anonymousDailyCallLimit,
    ),
    registeredDailyCallLimit: readBoundedPositiveInteger(
      env,
      "BEDROCK_REGISTERED_DAILY_CALL_LIMIT",
      DEFAULT_QUOTA_CONFIG.registeredDailyCallLimit,
    ),
  }
}

export function buildBedrockQuotaKeys(input: BedrockQuotaInput): BedrockQuotaKeys {
  const now = input.now ?? new Date()
  const day = now.toISOString().slice(0, 10)
  const month = day.slice(0, 7)
  const tier = input.userTier ?? "anonymous"
  const subjectId = sanitizeQuotaSubject(input.subjectId || "unknown-session")

  return {
    globalDailyKey: `quota#bedrock#global#day#${day}`,
    globalMonthlyKey: `quota#bedrock#global#month#${month}`,
    userDailyKey: `quota#bedrock#${tier}#${subjectId}#day#${day}`,
  }
}

export async function checkBedrockQuota(
  input: BedrockQuotaInput,
  options: CheckBedrockQuotaOptions = {},
): Promise<BedrockQuotaDecision> {
  const config = getBedrockQuotaConfig(options.env)
  if (!config.enabled) return { allowed: true }

  const runtime = await getRuntime(options.env, options.clientProvider)
  if (!runtime.ok) return { allowed: false, outcome: "quota_not_configured" }

  const keys = buildBedrockQuotaKeys(input)
  const userLimit =
    (input.userTier ?? "anonymous") === "registered"
      ? config.registeredDailyCallLimit
      : config.anonymousDailyCallLimit

  const checks: Array<{ key: string; limit: number; outcome: BedrockQuotaBlockedOutcome }> = [
    {
      key: keys.globalDailyKey,
      limit: config.globalDailyCallLimit,
      outcome: "quota_global_daily_limit",
    },
    {
      key: keys.globalMonthlyKey,
      limit: config.globalMonthlyCallLimit,
      outcome: "quota_global_monthly_limit",
    },
    {
      key: keys.userDailyKey,
      limit: userLimit,
      outcome: "quota_user_daily_limit",
    },
  ]

  const result = await incrementQuotaCounters(
    runtime.documentClient,
    runtime.config.tables.events,
    checks,
    input.now ?? new Date(),
  )

  if (result === "ok") return { allowed: true }
  if (result === "write-failed") {
    return { allowed: false, outcome: "quota_runtime_error" }
  }

  return { allowed: false, outcome: result }
}

async function getRuntime(
  env: EnvInput = process.env,
  clientProvider?: QuotaClientProvider,
): Promise<AskSafeDynamoClientResult> {
  if (clientProvider) return clientProvider()

  const awsEnv = getAskSafeAwsEnv(env)
  if (!awsEnv.ok) return awsEnv

  const { getAskSafeDynamoClient } = await import("./dynamodb.ts")
  return getAskSafeDynamoClient()
}

async function incrementQuotaCounters(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  checks: Array<{ key: string; limit: number; outcome: BedrockQuotaBlockedOutcome }>,
  now: Date,
): Promise<"ok" | "write-failed" | BedrockQuotaBlockedOutcome> {
  try {
    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: checks.map((check) => ({
          Update: {
            TableName: tableName,
            Key: { eventId: check.key },
            UpdateExpression:
              "SET quotaType = :quotaType, updatedAt = :updatedAt, expiresAt = :expiresAt ADD callCount :one",
            ConditionExpression: "attribute_not_exists(callCount) OR callCount < :limit",
            ExpressionAttributeValues: {
              ":quotaType": "bedrock-call-quota",
              ":updatedAt": now.toISOString(),
              ":expiresAt": Math.floor(now.getTime() / 1000) + 40 * 24 * 60 * 60,
              ":one": 1,
              ":limit": check.limit,
            },
          },
        })),
      }),
    )

    return "ok"
  } catch (error) {
    const failedIndex = getTransactionConditionalFailureIndex(error)
    if (failedIndex !== undefined) return checks[failedIndex]?.outcome ?? "write-failed"
    return "write-failed"
  }
}

function getTransactionConditionalFailureIndex(error: unknown): number | undefined {
  if (
    typeof error !== "object" ||
    error === null ||
    !("name" in error) ||
    error.name !== "TransactionCanceledException" ||
    !("CancellationReasons" in error) ||
    !Array.isArray(error.CancellationReasons)
  ) {
    return undefined
  }

  return error.CancellationReasons.findIndex(
    (reason) => reason?.Code === "ConditionalCheckFailed",
  )
}

function sanitizeQuotaSubject(value: string): string {
  const trimmed = value.trim().slice(0, 80)
  return trimmed.replace(/[^a-zA-Z0-9._:-]/g, "_") || "unknown-session"
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