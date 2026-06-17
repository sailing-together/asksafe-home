import { randomUUID } from "node:crypto"
import { PutCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import type { Category, RequestType, RiskLevel } from "../analyze.ts"
import type { RiskSignal } from "../safety-rules.ts"
import type { AskSafeAwsConfig } from "./aws-env.ts"

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

type PersistClientProvider = () =>
  | AskSafeDynamoClientResult
  | Promise<AskSafeDynamoClientResult>

type PersistOptions = {
  clientProvider?: PersistClientProvider
}

export type PersistenceResult =
  | { ok: true; id: string }
  | { skipped: true; reason: "missing-aws-config"; missing: string[] }
  | { ok: false; reason: "write-failed" }

export type SafetyEventInput = {
  category: Category
  requests: RequestType[]
  result: {
    risk: RiskLevel
    riskSignals: RiskSignal[]
    scamTypeIds: string[]
    sourceIds: string[]
  }
  rawMessage?: string
  anonymousSessionId?: string
  now?: Date
  eventId?: string
}

export type SafetyEventItem = {
  eventId: string
  createdAt: string
  category: Category
  requests: RequestType[]
  riskLevel: RiskLevel
  riskSignals: RiskSignal[]
  riskSignalIds: string[]
  scamTypeIds: string[]
  sourceIds: string[]
  anonymousSessionId?: string
}

export type FeedbackEventInput = {
  eventId?: string
  safetyEventId?: string
  helpful: boolean
  reason?: string
  anonymousSessionId?: string
  now?: Date
}

export type SupportEventInput = {
  eventId?: string
  safetyEventId?: string
  action: "setup-opened" | "code-created" | "summary-shared"
  anonymousSessionId?: string
  now?: Date
}

export function buildSafetyEventItem(input: SafetyEventInput): SafetyEventItem {
  const riskSignals = input.result.riskSignals

  return {
    eventId: input.eventId ?? randomUUID(),
    createdAt: (input.now ?? new Date()).toISOString(),
    category: input.category,
    requests: input.requests,
    riskLevel: input.result.risk,
    riskSignals,
    riskSignalIds: riskSignals.map((signal) => signal.id),
    scamTypeIds: input.result.scamTypeIds,
    sourceIds: input.result.sourceIds,
    anonymousSessionId: input.anonymousSessionId,
  }
}

export async function saveSafetyEvent(
  input: SafetyEventInput,
  options: PersistOptions = {},
): Promise<PersistenceResult> {
  const item = buildSafetyEventItem(input)
  const runtime = await getRuntime(options.clientProvider)

  if (!runtime.ok) {
    return {
      skipped: true,
      reason: "missing-aws-config",
      missing: runtime.missing,
    }
  }

  return putItem(runtime.documentClient, runtime.config.tables.events, item.eventId, item)
}

export async function saveFeedbackEvent(
  input: FeedbackEventInput,
  options: PersistOptions = {},
): Promise<PersistenceResult> {
  const runtime = await getRuntime(options.clientProvider)
  const eventId = input.eventId ?? randomUUID()

  if (!runtime.ok) {
    return {
      skipped: true,
      reason: "missing-aws-config",
      missing: runtime.missing,
    }
  }

  return putItem(runtime.documentClient, runtime.config.tables.feedback, eventId, {
    eventId,
    safetyEventId: input.safetyEventId,
    helpful: input.helpful,
    reason: input.reason,
    anonymousSessionId: input.anonymousSessionId,
    createdAt: (input.now ?? new Date()).toISOString(),
  })
}

export async function saveSupportEvent(
  input: SupportEventInput,
  options: PersistOptions = {},
): Promise<PersistenceResult> {
  const runtime = await getRuntime(options.clientProvider)
  const eventId = input.eventId ?? randomUUID()

  if (!runtime.ok) {
    return {
      skipped: true,
      reason: "missing-aws-config",
      missing: runtime.missing,
    }
  }

  return putItem(runtime.documentClient, runtime.config.tables.supportEvents, eventId, {
    eventId,
    safetyEventId: input.safetyEventId,
    action: input.action,
    anonymousSessionId: input.anonymousSessionId,
    createdAt: (input.now ?? new Date()).toISOString(),
  })
}

async function getRuntime(
  clientProvider?: PersistClientProvider,
): Promise<AskSafeDynamoClientResult> {
  if (clientProvider) {
    return clientProvider()
  }

  const { getAskSafeDynamoClient } = await import("./dynamodb.ts")
  return getAskSafeDynamoClient()
}

async function putItem(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  id: string,
  item: Record<string, unknown>,
): Promise<PersistenceResult> {
  try {
    await documentClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      }),
    )

    return { ok: true, id }
  } catch {
    return { ok: false, reason: "write-failed" }
  }
}
