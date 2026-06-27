import test from "node:test"
import assert from "node:assert/strict"

import {
  getBedrockQuotaConfig,
  buildBedrockQuotaKeys,
  checkBedrockQuota,
} from "./bedrock-quota.ts"

test("getBedrockQuotaConfig keeps conservative default call limits", () => {
  assert.deepEqual(getBedrockQuotaConfig({ ENABLE_BEDROCK_QUOTA: "true" }), {
    enabled: true,
    globalDailyCallLimit: 100,
    globalMonthlyCallLimit: 1000,
    anonymousDailyCallLimit: 3,
    registeredDailyCallLimit: 20,
  })
})

test("getBedrockQuotaConfig allows lower anonymous and registered limits", () => {
  assert.deepEqual(
    getBedrockQuotaConfig({
      ENABLE_BEDROCK_QUOTA: "true",
      BEDROCK_GLOBAL_DAILY_CALL_LIMIT: "50",
      BEDROCK_GLOBAL_MONTHLY_CALL_LIMIT: "600",
      BEDROCK_ANONYMOUS_DAILY_CALL_LIMIT: "2",
      BEDROCK_REGISTERED_DAILY_CALL_LIMIT: "10",
    }),
    {
      enabled: true,
      globalDailyCallLimit: 50,
      globalMonthlyCallLimit: 600,
      anonymousDailyCallLimit: 2,
      registeredDailyCallLimit: 10,
    },
  )
})

test("getBedrockQuotaConfig does not allow env to raise maximum defaults", () => {
  assert.deepEqual(
    getBedrockQuotaConfig({
      ENABLE_BEDROCK_QUOTA: "true",
      BEDROCK_GLOBAL_DAILY_CALL_LIMIT: "999999",
      BEDROCK_GLOBAL_MONTHLY_CALL_LIMIT: "999999",
      BEDROCK_ANONYMOUS_DAILY_CALL_LIMIT: "999999",
      BEDROCK_REGISTERED_DAILY_CALL_LIMIT: "999999",
    }),
    {
      enabled: true,
      globalDailyCallLimit: 100,
      globalMonthlyCallLimit: 1000,
      anonymousDailyCallLimit: 3,
      registeredDailyCallLimit: 20,
    },
  )
})

test("buildBedrockQuotaKeys separates anonymous and registered daily buckets", () => {
  const now = new Date("2026-06-27T10:30:00.000Z")

  assert.deepEqual(
    buildBedrockQuotaKeys({ userTier: "anonymous", subjectId: "abc", now }),
    {
      globalDailyKey: "quota#bedrock#global#day#2026-06-27",
      globalMonthlyKey: "quota#bedrock#global#month#2026-06",
      userDailyKey: "quota#bedrock#anonymous#abc#day#2026-06-27",
    },
  )

  assert.deepEqual(
    buildBedrockQuotaKeys({ userTier: "registered", subjectId: "abc", now }),
    {
      globalDailyKey: "quota#bedrock#global#day#2026-06-27",
      globalMonthlyKey: "quota#bedrock#global#month#2026-06",
      userDailyKey: "quota#bedrock#registered#abc#day#2026-06-27",
    },
  )
})
test("checkBedrockQuota increments global and user counters in the events table", async () => {
  const sentCommands: Array<{ input: Record<string, unknown> }> = []
  const documentClient = {
    send: async (command: { input: Record<string, unknown> }) => {
      sentCommands.push(command)
    },
  }

  const result = await checkBedrockQuota(
    {
      userTier: "registered",
      subjectId: "session-123",
      now: new Date("2026-06-27T10:30:00.000Z"),
    },
    {
      env: { ENABLE_BEDROCK_QUOTA: "true" },
      clientProvider: () => ({
        ok: true,
        config: {
          region: "ap-southeast-2",
          tables: {
            events: "events-table",
            feedback: "feedback-table",
            supportEvents: "support-events-table",
          },
        },
        documentClient: documentClient as never,
      }),
    },
  )

  assert.deepEqual(result, { allowed: true })
  assert.equal(sentCommands.length, 1)
  const transactItems = sentCommands[0]?.input.TransactItems as Array<{
    Update: { Key: Record<string, string>; TableName: string; ConditionExpression: string }
  }>
  assert.deepEqual(
    transactItems.map((item) => item.Update.Key),
    [
      { eventId: "quota#bedrock#global#day#2026-06-27" },
      { eventId: "quota#bedrock#global#month#2026-06" },
      { eventId: "quota#bedrock#registered#session-123#day#2026-06-27" },
    ],
  )
  assert.equal(transactItems[0]?.Update.TableName, "events-table")
  assert.equal(
    transactItems[0]?.Update.ConditionExpression,
    "attribute_not_exists(callCount) OR callCount < :limit",
  )
})

test("checkBedrockQuota blocks when the user daily counter reaches its limit", async () => {
  const documentClient = {
    send: async () => {
      const error = new Error("limit")
      error.name = "TransactionCanceledException"
      ;(error as Error & { CancellationReasons: Array<{ Code: string }> }).CancellationReasons = [
        { Code: "None" },
        { Code: "None" },
        { Code: "ConditionalCheckFailed" },
      ]
      throw error
    },
  }

  const result = await checkBedrockQuota(
    { userTier: "anonymous", subjectId: "anon-1" },
    {
      env: { ENABLE_BEDROCK_QUOTA: "true" },
      clientProvider: () => ({
        ok: true,
        config: {
          region: "ap-southeast-2",
          tables: {
            events: "events-table",
            feedback: "feedback-table",
            supportEvents: "support-events-table",
          },
        },
        documentClient: documentClient as never,
      }),
    },
  )

  assert.deepEqual(result, {
    allowed: false,
    outcome: "quota_user_daily_limit",
  })
})
