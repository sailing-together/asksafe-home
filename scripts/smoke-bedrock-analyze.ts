import {
  BEDROCK_ANALYZE_SMOKE_PAYLOAD,
  evaluateBedrockAnalyzeSmokeResponse,
} from "../lib/bedrock-analyze-smoke.ts"

const DEFAULT_BASE_URL = "https://asksafe-home.vercel.app"

const { baseUrl, expectBedrock } = parseArgs(process.argv.slice(2))
const endpoint = new URL("/api/analyze", baseUrl)

void main()

async function main() {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(BEDROCK_ANALYZE_SMOKE_PAYLOAD),
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

    const evaluation = evaluateBedrockAnalyzeSmokeResponse(body, { expectBedrock })
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

function parseArgs(args: string[]): { baseUrl: string; expectBedrock: boolean } {
  const expectBedrock = args.includes("--expect-bedrock")
  const baseUrl =
    args.find((arg) => !arg.startsWith("--")) ??
    process.env.ASKSAFE_SMOKE_BASE_URL ??
    DEFAULT_BASE_URL

  return {
    baseUrl,
    expectBedrock,
  }
}

function fail(details: unknown): never {
  console.error(JSON.stringify(details, null, 2))
  process.exit(1)
}
