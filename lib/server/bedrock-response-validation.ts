import type { BedrockAssistPayload } from "./bedrock-explanation.ts"

export type ValidatedBedrockExplanation = {
  saferNextStep: string
  why: string
  verificationSteps: string[]
  trustedSupportSummary: string
}

export type BedrockExplanationValidationResult =
  | {
      valid: true
      explanation: ValidatedBedrockExplanation
    }
  | {
      valid: false
      reason: "invalid_json" | "invalid_shape" | "safety_invariant_violation"
      detail?:
        | "not_object"
        | "unsupported_keys"
        | "missing_or_invalid_required_text"
        | "missing_verification_steps"
        | "too_many_verification_steps"
        | "invalid_verification_step"
    }

const ALLOWED_KEYS = new Set([
  "saferNextStep",
  "why",
  "verificationSteps",
  "trustedSupportSummary",
])

const MAX_SAFER_NEXT_STEP_LENGTH = 280
const MAX_WHY_LENGTH = 500
const MAX_VERIFICATION_STEP_LENGTH = 220
const MAX_TRUSTED_SUPPORT_SUMMARY_LENGTH = 280
const MAX_VERIFICATION_STEPS = 3

export function validateBedrockExplanationResponse(
  responseText: string,
  payload: BedrockAssistPayload,
): BedrockExplanationValidationResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(extractJsonObjectText(responseText))
  } catch {
    return {
      valid: false,
      reason: "invalid_json",
    }
  }

  if (!isRecord(parsed)) {
    return {
      valid: false,
      reason: "invalid_shape",
      detail: "not_object",
    }
  }

  if (hasUnsupportedKeys(parsed)) {
    return {
      valid: false,
      reason: "invalid_shape",
      detail: "unsupported_keys",
    }
  }

  const explanation = toValidatedExplanation(parsed)
  if (!explanation.valid) {
    return {
      valid: false,
      reason: "invalid_shape",
      detail: explanation.detail,
    }
  }

  if (weakensSafetyInvariants(explanation.explanation, payload)) {
    return {
      valid: false,
      reason: "safety_invariant_violation",
    }
  }

  return {
    valid: true,
    explanation: explanation.explanation,
  }
}

function extractJsonObjectText(responseText: string): string {
  const trimmed = responseText.trim()
  const fencedJson = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fencedJson?.[1]) return fencedJson[1].trim()

  const firstBrace = trimmed.indexOf("{")
  const lastBrace = trimmed.lastIndexOf("}")
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }

  return trimmed
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasUnsupportedKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) => !ALLOWED_KEYS.has(key))
}

function toValidatedExplanation(
  value: Record<string, unknown>,
):
  | { valid: true; explanation: ValidatedBedrockExplanation }
  | {
      valid: false
      detail: Extract<
        BedrockExplanationValidationResult,
        { valid: false }
      >["detail"]
    } {
  const saferNextStep = readBoundedString(
    value.saferNextStep,
    MAX_SAFER_NEXT_STEP_LENGTH,
  )
  const why = readBoundedString(value.why, MAX_WHY_LENGTH)
  const trustedSupportSummary = readBoundedString(
    value.trustedSupportSummary,
    MAX_TRUSTED_SUPPORT_SUMMARY_LENGTH,
  )

  if (!saferNextStep || !why || !trustedSupportSummary) {
    return { valid: false, detail: "missing_or_invalid_required_text" }
  }

  if (!Array.isArray(value.verificationSteps)) {
    return { valid: false, detail: "missing_verification_steps" }
  }

  if (value.verificationSteps.length === 0) {
    return { valid: false, detail: "missing_verification_steps" }
  }

  if (
    value.verificationSteps.length > MAX_VERIFICATION_STEPS
  ) {
    return { valid: false, detail: "too_many_verification_steps" }
  }

  const verificationSteps = value.verificationSteps.map((step) =>
    readBoundedString(step, MAX_VERIFICATION_STEP_LENGTH),
  )
  if (verificationSteps.some((step) => !step)) {
    return { valid: false, detail: "invalid_verification_step" }
  }

  return {
    valid: true,
    explanation: {
      saferNextStep,
      why,
      verificationSteps: verificationSteps as string[],
      trustedSupportSummary,
    },
  }
}

function readBoundedString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLength) return undefined

  return trimmed
}

function weakensSafetyInvariants(
  explanation: ValidatedBedrockExplanation,
  payload: BedrockAssistPayload,
): boolean {
  const text = [
    explanation.saferNextStep,
    explanation.why,
    explanation.trustedSupportSummary,
    ...explanation.verificationSteps,
  ]
    .join(" ")
    .toLowerCase()

  return payload.doNotYet.some((warning) =>
    contradictsWarning(text, warning.toLowerCase()),
  )
}

function contradictsWarning(text: string, warning: string): boolean {
  if (warning.includes("money") || warning.includes("pay")) {
    return /\b(you can|go ahead and|okay to|safe to)\s+(send|pay|transfer)\b/.test(
      text,
    )
  }

  if (warning.includes("link") || warning.includes("click")) {
    return /\b(you can|go ahead and|okay to|safe to)\s+(click|tap|open)\b/.test(
      text,
    )
  }

  if (
    warning.includes("password") ||
    warning.includes("pin") ||
    warning.includes("one-time code") ||
    warning.includes("code")
  ) {
    return /\b(you can|go ahead and|okay to|safe to)\s+(share|give|send)\b.*\b(code|pin|password)\b/.test(
      text,
    )
  }

  if (warning.includes("install")) {
    return /\b(you can|go ahead and|okay to|safe to)\s+install\b/.test(text)
  }

  if (warning.includes("screen")) {
    return /\b(you can|go ahead and|okay to|safe to)\s+share\b.*\bscreen\b/.test(
      text,
    )
  }

  return false
}
