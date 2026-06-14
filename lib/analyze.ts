export type RiskLevel = "low" | "caution" | "high"

export type Category =
  | "money"
  | "message"
  | "caller"
  | "door"
  | "online"
  | "other"

export interface SafetyResult {
  risk: RiskLevel
  headline: string
  saferStep: string
  doNotYet: string[]
  why: string
  verify: string[]
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

export function analyze(message: string, category: Category): SafetyResult {
  const text = message.trim()
  const highHits = HIGH_SIGNALS.filter((s) => s.pattern.test(text))
  const cautionHits = CAUTION_SIGNALS.filter((s) => s.pattern.test(text))

  let risk: RiskLevel = "low"
  if (highHits.length >= 1) risk = "high"
  else if (cautionHits.length >= 1) risk = "caution"

  // A second independent signal pushes caution up to high.
  if (risk === "caution" && cautionHits.length + highHits.length >= 2) {
    risk = "high"
  }

  const reasons = [...highHits, ...cautionHits].map((s) => s.reason)

  if (risk === "high") {
    return {
      risk,
      headline: "This looks unsafe. It's good you paused.",
      saferStep:
        "Stop here for now. Don't reply, pay, or share anything. Take a breath, then talk it through with someone you trust before doing anything else.",
      doNotYet: [
        "Don't send any money, gift cards, or bank details",
        "Don't click links or install anything they asked for",
        "Don't share passwords, PINs, or one-time codes",
        "Don't feel rushed — real organisations let you take your time",
      ],
      why:
        reasons.length > 0
          ? `Some of the wording is a common sign of a scam — for example, it's ${joinReasons(reasons)}. These are pressure tactics scammers use to stop you thinking it through.`
          : "Several parts of this match the way scams are usually written, especially the pressure to act quickly.",
      verify: verifySteps(category),
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
      verify: verifySteps(category),
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
    verify: verifySteps(category),
  }
}

function joinReasons(reasons: string[]): string {
  const unique = Array.from(new Set(reasons))
  if (unique.length === 1) return unique[0]
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`
  return `${unique.slice(0, -1).join(", ")}, and ${unique[unique.length - 1]}`
}

function verifySteps(category: Category): string[] {
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
    default:
      return [
        "Take a pause — you don't have to decide right now.",
        "Confirm details using a source you already trust.",
        "Talk it over with someone close before acting.",
      ]
  }
}
