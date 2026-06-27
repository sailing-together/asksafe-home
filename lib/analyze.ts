import { assessSafetyInput, type RiskSignal } from "./safety-rules.ts"

export type RiskLevel = "low" | "caution" | "high"

export type Category =
  | "money"
  | "message"
  | "caller"
  | "door"
  | "online"
  | "video"
  | "other"

export type RequestType =
  | "pay"
  | "link"
  | "code"
  | "details"
  | "callback"
  | "install"
  | "screen"
  | "unsure"

export interface SafetyClarification {
  needed: true
  question: string
  reason: string
  checks: string[]
}

// What each "what do they want" choice signals, and how strongly.
const REQUEST_SIGNALS: Record<
  RequestType,
  { weight: "high" | "caution" | "none"; reason: string }
> = {
  pay: { weight: "high", reason: "asking you to pay or transfer money" },
  code: { weight: "high", reason: "asking you to share a code" },
  details: { weight: "high", reason: "asking for your personal details" },
  install: { weight: "high", reason: "asking you to install an app" },
  screen: { weight: "high", reason: "asking you to share your screen" },
  link: { weight: "caution", reason: "asking you to click a link" },
  callback: { weight: "caution", reason: "asking you to call a number back" },
  unsure: { weight: "none", reason: "" },
}

export interface SafetyResult {
  risk: RiskLevel
  headline: string
  saferStep: string
  doNotYet: string[]
  why: string
  verify: string[]
  riskSignals: RiskSignal[]
  scamTypeIds: string[]
  sourceIds: string[]
  clarification?: SafetyClarification
}

const HIGH_SIGNALS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(gift ?card|itunes|google play|steam card)\b/i, reason: "asking for payment by gift card" },
  { pattern: /\b(bitcoin|crypto|wire transfer|western union|moneygram)\b/i, reason: "asking for an unusual money transfer" },
  { pattern: /\b(bank|account|password|pin|one[- ]?time code|otp|verification code)\b/i, reason: "asking for banking or security details" },
  { pattern: /\b(remote access|anydesk|teamviewer|install (an )?app)\b/i, reason: "asking to control your device remotely" },
  { pattern: /\b(arrest|warrant|lawsuit|court|fine|tax debt|ato)\b/i, reason: "using threats of legal trouble" },
  { pattern: /\b(urgent|immediately|right now|act now|within \d+ ?(min|hour))\b/i, reason: "creating a sense of urgency" },
  { pattern: /\b(don'?t tell|keep (it|this) secret|between us)\b/i, reason: "asking you to keep it secret" },
  { pattern: /\b(grand ?(son|daughter)|it'?s me|stranded|emergency)\b/i, reason: "pretending to be a family member in trouble" },
]

const CAUTION_SIGNALS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(click (the|this) link|http|www\.|short ?link)\b/i, reason: "asking you to click a link" },
  { pattern: /\b(won|prize|lottery|reward|refund|inheritance)\b/i, reason: "promising money or a prize" },
  { pattern: /\b(subscription|renew|expired|suspended|locked)\b/i, reason: "warning about an account problem" },
  { pattern: /\b(delivery|parcel|package|postage|customs)\b/i, reason: "mentioning an unexpected delivery" },
  { pattern: /\b(invest|guaranteed return|double your)\b/i, reason: "offering an investment" },
]

export function analyze(
  message: string,
  category: Category,
  requests: RequestType[] = [],
): SafetyResult {
  const text = message.trim()
  const ruleAssessment = assessSafetyInput({ message: text, category, requests })
  const clarification = buildClarification(ruleAssessment)
  const textHigh = HIGH_SIGNALS.filter((s) => s.pattern.test(text))
  const textCaution = CAUTION_SIGNALS.filter((s) => s.pattern.test(text))

  // Turn the selected "what do they want" choices into signals too.
  const chosen = requests.map((r) => REQUEST_SIGNALS[r])
  const requestHigh = chosen.filter((s) => s.weight === "high")
  const requestCaution = chosen.filter((s) => s.weight === "caution")

  const highHits = [...textHigh, ...requestHigh]
  const cautionHits = [...textCaution, ...requestCaution]

  let risk: RiskLevel = "low"
  if (highHits.length >= 1) risk = "high"
  else if (cautionHits.length >= 1) risk = "caution"

  // A second independent signal pushes caution up to high.
  if (risk === "caution" && cautionHits.length + highHits.length >= 2) {
    risk = "high"
  }

  risk = highestRisk(risk, ruleAssessment.riskLevel)

  const reasons = [...highHits, ...cautionHits].map((s) => s.reason)

  if (risk === "high") {
    const contextualCopy = getContextualHighRiskCopy(ruleAssessment, category)

    return {
      risk,
      headline: contextualCopy?.headline ?? "This looks unsafe. It's good you paused.",
      saferStep:
        getContextualHighRiskSaferStep(ruleAssessment) ??
        "Stop here for now. Don't reply, pay, or share anything. Take a breath, then talk it through with someone you trust before doing anything else.",
      doNotYet: getContextualHighRiskDoNotYet(ruleAssessment) ?? [
        "Don't send any money, gift cards, or bank details",
        "Don't click links or install anything they asked for",
        "Don't share passwords, PINs, or one-time codes",
        "Don't feel rushed — real organisations let you take your time",
      ],
      why:
        contextualCopy?.why ??
        (reasons.length > 0
          ? `Some of the wording is a common sign of a scam — for example, it's ${joinReasons(reasons)}. These are pressure tactics scammers use to stop you thinking it through.`
          : "Several parts of this match the way scams are usually written, especially the pressure to act quickly."),
      verify: verifySteps(category, ruleAssessment),
      riskSignals: ruleAssessment.riskSignals,
      scamTypeIds: ruleAssessment.scamTypeIds,
      sourceIds: ruleAssessment.sourceIds,
      clarification,
    }
  }

  if (risk === "caution") {
    return {
      risk,
      headline: "Worth a closer look before you act.",
      saferStep:
        "There's no need to rush. Check who really sent this using details you already trust, not the ones in the message itself.",
      doNotYet: [
        "Don't click any links inside the message yet",
        "Don't enter personal or payment details until you've checked",
        "Don't reply with private information",
      ],
      why:
        reasons.length > 0
          ? `One part stood out — it's ${joinReasons(reasons)}. That doesn't always mean it's a scam, but it's worth confirming first.`
          : "A few details here are worth confirming before you take any action.",
      verify: verifySteps(category, ruleAssessment),
      riskSignals: ruleAssessment.riskSignals,
      scamTypeIds: ruleAssessment.scamTypeIds,
      sourceIds: ruleAssessment.sourceIds,
      clarification,
    }
  }

  return {
    risk,
    headline: "Nothing here looks alarming.",
    saferStep:
      "This seems okay from what you've shared. If anything still feels off to you, trust that feeling and check with someone before acting.",
    doNotYet: [
      "Don't share more than you need to",
      "Don't act faster than feels comfortable",
    ],
    why: "I didn't spot the common warning signs of a scam in what you wrote. Your own gut feeling still matters most.",
    verify: verifySteps(category, ruleAssessment),
    riskSignals: ruleAssessment.riskSignals,
    scamTypeIds: ruleAssessment.scamTypeIds,
    sourceIds: ruleAssessment.sourceIds,
    clarification,
  }
}

function getContextualHighRiskCopy(
  ruleAssessment: ReturnType<typeof assessSafetyInput>,
  category: Category,
): { headline: string; why: string } | undefined {
  const signalIds = new Set(ruleAssessment.riskSignals.map((signal) => signal.id))

  if (signalIds.has("family-money-request")) {
    const channel = category === "video" ? "video call" : "message or call"

    return {
      headline: "Pause before sending money.",
      why: `A request for money from someone close to you over a ${channel} needs a separate check. It may be genuine, but the safer move is to confirm through a saved number or account before you pay.`,
    }
  }

  if (signalIds.has("remote-access")) {
    return {
      headline: "Do not install anything or share your screen.",
      why: "A caller, message, or pop-up asking for remote access can put your device and accounts at risk. End the interaction and contact the person or company another way you already trust.",
    }
  }

  if (signalIds.has("payment-request")) {
    return {
      headline: "Pause before paying until you know more.",
      why: "This involves money, and there is not enough context yet to know who is asking or whether the request is expected. You need more information, and the safer move is to verify it through details you already trust before paying.",
    }
  }

  return undefined
}
function getContextualHighRiskSaferStep(
  ruleAssessment: ReturnType<typeof assessSafetyInput>,
): string | undefined {
  const signalIds = new Set(ruleAssessment.riskSignals.map((signal) => signal.id))

  if (
    signalIds.has("remote-access") ||
    signalIds.has("family-money-request") ||
    signalIds.has("payment-request")
  ) {
    return ruleAssessment.saferNextStep
  }

  return undefined
}

function getContextualHighRiskDoNotYet(
  ruleAssessment: ReturnType<typeof assessSafetyInput>,
): string[] | undefined {
  const signalIds = new Set(ruleAssessment.riskSignals.map((signal) => signal.id))

  if (signalIds.has("family-money-request")) {
    return [
      "Don't send money until you confirm through a saved number or account",
      "Don't rely on the face, voice, or video call alone",
      "Don't use a new number, link, or account they gave you in this request",
      "Don't keep the request secret if it feels rushed or unusual",
    ]
  }

  return undefined
}
function buildClarification(
  ruleAssessment: ReturnType<typeof assessSafetyInput>,
): SafetyClarification | undefined {
  const signalIds = new Set(ruleAssessment.riskSignals.map((signal) => signal.id))

  if (hasHardStopSignal(signalIds)) {
    return undefined
  }

  if (signalIds.has("family-money-request")) {
    return {
      needed: true,
      question:
        "Before you decide, check one thing: how did they contact you, and how do they want the money sent?",
      reason: "A money request from someone close should be verified another way before you act.",
      checks: [
        "How did they contact you?",
        "Is this a new number, account, or chat?",
        "How much money do they want, and how do they want it sent?",
        "Can you contact them using a saved number or account you already trust?",
      ],
    }
  }

  if (signalIds.has("payment-request")) {
    return {
      needed: true,
      question:
        "Before you decide, check one thing: who is asking, and how do they want you to pay?",
      reason:
        "The request involves payment, but the person and payment method still need checking.",
      checks: [
        "Who is asking you to pay?",
        "How do they want you to pay?",
        "Did you expect this request?",
        "Can you verify it through details you already trust?",
      ],
    }
  }

  return undefined
}

function hasHardStopSignal(signalIds: Set<string>): boolean {
  return (
    signalIds.has("code-request") ||
    signalIds.has("remote-access") ||
    signalIds.has("personal-details")
  )
}

function highestRisk(current: RiskLevel, next: RiskLevel): RiskLevel {
  const rank: Record<RiskLevel, number> = {
    low: 0,
    caution: 1,
    high: 2,
  }

  return rank[next] > rank[current] ? next : current
}

function joinReasons(reasons: string[]): string {
  const unique = Array.from(new Set(reasons))
  if (unique.length === 1) return unique[0]
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`
  return `${unique.slice(0, -1).join(", ")}, and ${unique[unique.length - 1]}`
}

function verifySteps(
  category: Category,
  ruleAssessment?: ReturnType<typeof assessSafetyInput>,
): string[] {
  const signalIds = new Set(
    ruleAssessment?.riskSignals.map((signal) => signal.id) ?? [],
  )

  if (signalIds.has("family-money-request")) {
    return [
      "Ask a question only your family would know, but do not enter or save the answer in AskSafe.",
      "Contact them back using a saved number or account you already trust.",
      "Do not rely on the face, voice, or message alone before sending money.",
    ]
  }
  switch (category) {
    case "caller":
      return [
        "Hang up. Wait a few minutes so the line fully clears.",
        "Find the organisation's number yourself — from a bill, the back of your card, or their official website.",
        "Call that number and ask if they really contacted you.",
      ]
    case "message":
      return [
        "Don't tap any links or numbers in the message.",
        "Look up the company's real contact details separately.",
        "Contact them directly to ask if the message is genuine.",
      ]
    case "money":
      return [
        "Pause any payment — there is no real deadline you must meet right now.",
        "Phone your bank using the number on the back of your card.",
        "Ask them to confirm whether the request is real and safe.",
      ]
    case "door":
      return [
        "You don't have to open the door or let anyone in.",
        "Ask for ID and the company name through the closed door.",
        "Call the company yourself using a number you find independently.",
      ]
    case "online":
      return [
        "Close the page or pop-up without clicking buttons inside it.",
        "Type the website address yourself instead of using a link.",
        "If unsure, ask someone you trust to look with you.",
      ]
    case "video":
      return [
        "It's okay to end the call or close the chat at any time.",
        "Don't install apps or share your screen because someone on the call asked you to.",
        "Reach the person or company another way you already trust to confirm it's really them.",
      ]
    default:
      return [
        "Take a pause — you don't have to decide right now.",
        "Confirm details using a source you already trust.",
        "Talk it over with someone close before acting.",
      ]
  }
}
