import {
  analyze,
  type Category,
  type RequestType,
  type RiskLevel,
  type SafetyResult,
} from "./analyze.ts"
import type { RiskSignal } from "./safety-rules.ts"

type AnalyzeSafetyInput = {
  message: string
  category: Category
  requests: RequestType[]
  userTier?: "anonymous" | "registered"
  quotaSubjectId?: string
}

type AnalyzeSafetyOptions = {
  fetch?: typeof globalThis.fetch
  apiTimeoutMs?: number
}

const RISK_LEVELS: readonly RiskLevel[] = ["low", "caution", "high"]
const DEFAULT_API_TIMEOUT_MS = 4500

export async function analyzeSafetyWithFallback(
  input: AnalyzeSafetyInput,
  options: AnalyzeSafetyOptions = {},
): Promise<SafetyResult> {
  const localResult = () => analyze(input.message, input.category, input.requests)
  const fetchImpl = options.fetch ?? globalThis.fetch
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    const response = await Promise.race([
      fetchImpl("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error("analyze-api-timeout"))
        }, options.apiTimeoutMs ?? DEFAULT_API_TIMEOUT_MS)
      }),
    ])

    if (!response.ok) return localResult()

    const body: unknown = await response.json()
    if (!isRecord(body) || body.ok !== true || !isSafetyResult(body.result)) {
      return localResult()
    }

    return body.result
  } catch {
    return localResult()
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

function isSafetyResult(value: unknown): value is SafetyResult {
  if (!isRecord(value)) return false

  return (
    isRiskLevel(value.risk) &&
    typeof value.headline === "string" &&
    typeof value.saferStep === "string" &&
    isStringArray(value.doNotYet) &&
    typeof value.why === "string" &&
    isStringArray(value.verify) &&
    isRiskSignalArray(value.riskSignals) &&
    isStringArray(value.scamTypeIds) &&
    isStringArray(value.sourceIds)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === "string" && RISK_LEVELS.includes(value as RiskLevel)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isRiskSignalArray(value: unknown): value is RiskSignal[] {
  return Array.isArray(value) && value.every(isRiskSignal)
}

function isRiskSignal(value: unknown): value is RiskSignal {
  if (!isRecord(value)) return false
  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    (value.severity === "high" || value.severity === "caution")
  )
}
