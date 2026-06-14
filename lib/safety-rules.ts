import type { Category, RequestType, RiskLevel } from "./analyze"
import { TRUSTED_SCAM_PATTERNS } from "./trusted-scam-patterns.ts"

export type RiskSignalId =
  | "family-money-request"
  | "payment-request"
  | "video-call"
  | "remote-access"
  | "link-request"
  | "code-request"
  | "personal-details"
  | "urgency"

export type RiskSignal = {
  id: RiskSignalId
  label: string
  severity: "high" | "caution"
}

export type SafetyRuleAssessment = {
  riskLevel: RiskLevel
  riskSignals: RiskSignal[]
  scamTypeIds: string[]
  sourceIds: string[]
  suggestedRequests: RequestType[]
  followUpQuestion: string
  saferNextStep: string
}

export type SafetyRuleInput = {
  message: string
  category: Category
  requests?: RequestType[]
}

const FAMILY_PATTERN =
  /\b(daughter|son|mum|mom|mother|dad|father|grandson|granddaughter|family|relative|friend|neighbou?r|carer)\b/i
const MONEY_PATTERN =
  /\b(money|pay|payment|transfer|bank|card|gift card|cash|loan|borrow|bpay|crypto|aud|\$)\b/i
const URGENCY_PATTERN =
  /\b(urgent|right now|now|today|immediately|quick|hurry|deadline|before)\b/i
const LINK_PATTERN = /\b(link|http|www\.|tap|click)\b/i
const CODE_PATTERN = /\b(code|otp|one[- ]?time|pin|password)\b/i
const DETAILS_PATTERN = /\b(details|identity|address|medicare|passport|driver'?s licence|card number)\b/i
const REMOTE_PATTERN = /\b(anydesk|teamviewer|remote access|install|share (my )?screen|screen share)\b/i

export function assessSafetyInput({
  message,
  category,
  requests = [],
}: SafetyRuleInput): SafetyRuleAssessment {
  const text = message.trim()
  const signals: RiskSignal[] = []
  const scamTypeIds = new Set<string>()
  const sourceIds = new Set<string>()
  const suggestedRequests = new Set<RequestType>(requests)
  const matchedPatterns = TRUSTED_SCAM_PATTERNS.filter((pattern) =>
    pattern.matchers.every((matcher) => matcher.test(text)),
  )

  for (const pattern of matchedPatterns) {
    scamTypeIds.add(pattern.id)
    pattern.sourceIds.forEach((sourceId) => sourceIds.add(sourceId))
    pattern.signals.forEach((signal) => addSignal(signals, signal))
  }

  const hasMoney = requests.includes("pay") || MONEY_PATTERN.test(text)
  const hasFamily = FAMILY_PATTERN.test(text)
  const hasRemote =
    requests.includes("install") ||
    requests.includes("screen") ||
    REMOTE_PATTERN.test(text)

  if (hasMoney && hasFamily) {
    addSignal(signals, {
      id: "family-money-request",
      label: "money request from someone close",
      severity: "high",
    })
    suggestedRequests.add("pay")
  }

  if (hasMoney || requests.includes("pay")) {
    addSignal(signals, {
      id: "payment-request",
      label: "asking for money or payment",
      severity: "high",
    })
    suggestedRequests.add("pay")
  }

  if (category === "video") {
    addSignal(signals, {
      id: "video-call",
      label: "request happened on a video call or chat",
      severity: "caution",
    })
  }

  if (hasRemote) {
    addSignal(signals, {
      id: "remote-access",
      label: "asking for device access",
      severity: "high",
    })
    suggestedRequests.add("install")
    suggestedRequests.add("screen")
  }

  if (requests.includes("link") || LINK_PATTERN.test(text)) {
    addSignal(signals, {
      id: "link-request",
      label: "asking you to use a link",
      severity: "caution",
    })
    suggestedRequests.add("link")
  }

  if (requests.includes("code") || CODE_PATTERN.test(text)) {
    addSignal(signals, {
      id: "code-request",
      label: "asking for a code or password",
      severity: "high",
    })
    suggestedRequests.add("code")
  }

  if (requests.includes("details") || DETAILS_PATTERN.test(text)) {
    addSignal(signals, {
      id: "personal-details",
      label: "asking for personal details",
      severity: "high",
    })
    suggestedRequests.add("details")
  }

  if (URGENCY_PATTERN.test(text)) {
    addSignal(signals, {
      id: "urgency",
      label: "creating time pressure",
      severity: "caution",
    })
  }

  const riskLevel = getRiskLevel(signals)

  return {
    riskLevel,
    riskSignals: signals,
    scamTypeIds: Array.from(scamTypeIds),
    sourceIds: Array.from(sourceIds),
    suggestedRequests: Array.from(suggestedRequests),
    followUpQuestion: getFollowUpQuestion(signals),
    saferNextStep: getSaferNextStep(signals, riskLevel, matchedPatterns),
  }
}

function addSignal(signals: RiskSignal[], signal: RiskSignal) {
  if (signals.some((item) => item.id === signal.id)) return
  signals.push(signal)
}

function getRiskLevel(signals: RiskSignal[]): RiskLevel {
  if (signals.some((signal) => signal.severity === "high")) return "high"
  if (signals.length > 0) return "caution"
  return "low"
}

function getFollowUpQuestion(signals: RiskSignal[]): string {
  if (signals.some((signal) => signal.id === "remote-access")) {
    return "Who asked you to install something or share your screen?"
  }

  if (signals.some((signal) => signal.id === "family-money-request")) {
    return "How did they contact you, and how do they want the money sent?"
  }

  if (signals.some((signal) => signal.id === "payment-request")) {
    return "Who is asking, and how do they want you to pay?"
  }

  if (signals.some((signal) => signal.id === "code-request")) {
    return "Who asked for the code, and why did they say they need it?"
  }

  if (signals.some((signal) => signal.id === "link-request")) {
    return "Who does the message claim to be from?"
  }

  return "If anything still feels off, what part is making you unsure?"
}

function getSaferNextStep(
  signals: RiskSignal[],
  riskLevel: RiskLevel,
  matchedPatterns: (typeof TRUSTED_SCAM_PATTERNS)[number][] = [],
): string {
  if (matchedPatterns[0]?.safeNextSteps.length) {
    return matchedPatterns[0].safeNextSteps.join(" ")
  }

  if (signals.some((signal) => signal.id === "remote-access")) {
    return "Do not install anything or share your screen. End the call and contact the person or company another way you already trust."
  }

  if (signals.some((signal) => signal.id === "family-money-request")) {
    return "Pause before paying. Contact the person using a number or account you already know, not the one from this request."
  }

  if (signals.some((signal) => signal.id === "payment-request")) {
    return "Pause before paying or transferring money. Verify the request through a trusted channel first."
  }

  if (riskLevel === "caution") {
    return "Check the request through a trusted source before you click, reply, or share anything."
  }

  return "Nothing major stands out yet. Take your time and check with someone you trust if anything still feels wrong."
}
