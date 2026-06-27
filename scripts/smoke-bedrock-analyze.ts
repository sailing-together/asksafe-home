import {
  BEDROCK_ANALYZE_SMOKE_PAYLOAD,
  evaluateBedrockAnalyzeSmokeResponse,
} from "../lib/bedrock-analyze-smoke.ts"

const DEFAULT_BASE_URL = "https://asksafe-home.vercel.app"

const { baseUrl, expectBedrock, expectBedrockOutcome, quotaSubjectId, userTier } =
  parseArgs(process.argv.slice(2))
const endpoint = new URL("/api/analyze", baseUrl)

void main()

async function main() {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...BEDROCK_ANALYZE_SMOKE_PAYLOAD,
        ...(quotaSubjectId ? { quotaSubjectId } : {}),
        ...(userTier ? { userTier } : {}),
      }),
    })
    const body: unknown = await response.json()

    if (!response.ok) {
      fail({
        ok: false,
        reason: "http-error",
        status: response.status,
        endpoint: endpoint.toString(),
        body,
      })
    }

    const evaluation = evaluateBedrockAnalyzeSmokeResponse(body, {
      expectBedrock,
      expectBedrockOutcome,
    })
    if (!evaluation.ok) {
      fail({
        ...evaluation,
        endpoint: endpoint.toString(),
      })
    }

    console.log(
      JSON.stringify(
        {
          endpoint: endpoint.toString(),
          expectBedrock,
          ...(expectBedrockOutcome ? { expectBedrockOutcome } : {}),
          ...(quotaSubjectId ? { quotaSubjectId } : {}),
          ...(userTier ? { userTier } : {}),
          ...evaluation,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    fail({
      ok: false,
      reason: "request-failed",
      endpoint: endpoint.toString(),
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function parseArgs(args: string[]): {
  baseUrl: string
  expectBedrock: boolean
  expectBedrockOutcome?: string
  quotaSubjectId?: string
  userTier?: "anonymous" | "registered"
} {
  const expectBedrock = args.includes("--expect-bedrock")
  const expectBedrockOutcome = readFlagValue(args, "--expect-bedrock-outcome")
  const quotaSubjectId = readFlagValue(args, "--quota-subject-id")
  const userTierValue = readFlagValue(args, "--user-tier")
  const userTier =
    userTierValue === "registered" || userTierValue === "anonymous"
      ? userTierValue
      : undefined
  const baseUrl =
    args.find((arg, index) => !arg.startsWith("--") && !isFlagValue(args, index)) ??
    process.env.ASKSAFE_SMOKE_BASE_URL ??
    DEFAULT_BASE_URL

  return {
    baseUrl,
    expectBedrock,
    expectBedrockOutcome,
    quotaSubjectId,
    userTier,
  }
}

function readFlagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)
  if (index === -1) return undefined

  const value = args[index + 1]?.trim()
  if (!value || value.startsWith("--")) return undefined

  return value
}

function isFlagValue(args: string[], index: number): boolean {
  const previous = args[index - 1]
  return (
    previous === "--expect-bedrock-outcome" ||
    previous === "--quota-subject-id" ||
    previous === "--user-tier"
  )
}

function fail(details: unknown): never {
  console.error(JSON.stringify(details, null, 2))
  process.exit(1)
}
