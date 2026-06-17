import "server-only"

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { getAskSafeAwsEnv, type AskSafeAwsConfig } from "./aws-env.ts"

export type AskSafeDynamoClientResult =
  | {
      ok: true
      config: AskSafeAwsConfig
      documentClient: DynamoDBDocumentClient
    }
  | {
      ok: false
      missing: string[]
    }

export function getAskSafeDynamoClient(): AskSafeDynamoClientResult {
  const env = getAskSafeAwsEnv()

  if (!env.ok) {
    return { ok: false, missing: env.missing }
  }

  const client = new DynamoDBClient({
    region: env.config.region,
  })

  return {
    ok: true,
    config: env.config,
    documentClient: DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    }),
  }
}
