import type { RiskSignalId } from "./safety-rules"

export type TrustedScamPattern = {
  id: string
  label: string
  riskLevel: "high" | "caution"
  sourceIds: string[]
  signals: {
    id: RiskSignalId
    label: string
    severity: "high" | "caution"
  }[]
  matchers: RegExp[]
  safeNextSteps: string[]
}

// Compact seed patterns derived from asksafe-h0/research/knowledge/trusted-scam-patterns-v1.json.
// Keep this file short and source-linked; do not copy long report or website text into runtime code.
export const TRUSTED_SCAM_PATTERNS: TrustedScamPattern[] = [
  {
    id: "family-emergency",
    label: "Family emergency scam",
    riskLevel: "high",
    sourceIds: ["scamwatch-types", "scamwatch-methods"],
    signals: [
      {
        id: "family-money-request",
        label: "claims to be family and asks for urgent money",
        severity: "high",
      },
      {
        id: "urgency",
        label: "creates urgency or asks not to call",
        severity: "caution",
      },
    ],
    matchers: [
      /\b(hi mum|hi mom|mum|mom|daughter|son|grandson|granddaughter|family)\b/i,
      /\b(broke my phone|new phone|new number|do not call|don'?t call|urgent|urgently|emergency)\b/i,
      /\b(send|transfer|pay).*\b(money|account|bank|aud|\$)\b/i,
    ],
    safeNextSteps: [
      "Do not send money yet.",
      "Call the family member using the number already saved.",
      "Contact another trusted family member if the person cannot be reached.",
    ],
  },
  {
    id: "delivery-parcel",
    label: "Delivery or parcel scam",
    riskLevel: "high",
    sourceIds: ["scamwatch-types", "scamwatch-methods"],
    signals: [
      {
        id: "link-request",
        label: "message includes a delivery or payment link",
        severity: "caution",
      },
      {
        id: "payment-request",
        label: "asks for a small fee or card details",
        severity: "high",
      },
    ],
    matchers: [
      /\b(parcel|package|delivery|redelivery|postage|customs|auspost)\b/i,
      /\b(fee|pay|payment|card|redelivery fee)\b/i,
      /\b(link|http|www\.|tap|click)\b/i,
    ],
    safeNextSteps: [
      "Do not use the link in the message.",
      "Check delivery status through the official delivery app or website.",
      "If unsure, ask a trusted person before paying.",
    ],
  },
  {
    id: "banking-payment",
    label: "Banking or payment scam",
    riskLevel: "high",
    sourceIds: ["scamwatch-types", "scamwatch-stop-check-protect"],
    signals: [
      {
        id: "payment-request",
        label: "asks for banking, payment, or account action",
        severity: "high",
      },
      {
        id: "link-request",
        label: "uses a message link instead of official channels",
        severity: "caution",
      },
    ],
    matchers: [
      /\b(bank|account|card|payment|transfer)\b/i,
      /\b(locked|compromised|suspended|verify|new account)\b/i,
      /\b(link|http|www\.|tap|click|code|password|otp)\b/i,
    ],
    safeNextSteps: [
      "Do not click message links.",
      "Do not share passwords or one-time codes.",
      "Open the bank app directly or call the number on the bank card.",
    ],
  },
  {
    id: "remote-access-tech-support",
    label: "Remote access or tech support scam",
    riskLevel: "high",
    sourceIds: ["scamwatch-types", "scamwatch-methods"],
    signals: [
      {
        id: "remote-access",
        label: "asks to install software or share the screen",
        severity: "high",
      },
      {
        id: "payment-request",
        label: "may ask for payment to fix a problem",
        severity: "high",
      },
    ],
    matchers: [
      /\b(hacked|virus|computer|phone|support|microsoft|technical)\b/i,
      /\b(anydesk|teamviewer|remote access|install|share (my )?screen|screen share)\b/i,
    ],
    safeNextSteps: [
      "Do not install remote access tools from a caller or pop-up.",
      "Close the message or page if safe to do so.",
      "Contact official support through a trusted website or ask a trusted person.",
    ],
  },
  {
    id: "verification-code",
    label: "Verification code or account takeover scam",
    riskLevel: "high",
    sourceIds: ["scamwatch-methods", "scamwatch-stop-check-protect"],
    signals: [
      {
        id: "code-request",
        label: "asks for a one-time code or password",
        severity: "high",
      },
    ],
    matchers: [
      /\b(code|otp|one[- ]?time|six[- ]?digit|verification code|pin|password)\b/i,
      /\b(sent by mistake|login|account recovery|verify)\b/i,
    ],
    safeNextSteps: [
      "Do not share one-time codes.",
      "Change passwords through official apps if account access feels wrong.",
      "Ask a trusted person before responding.",
    ],
  },
]

