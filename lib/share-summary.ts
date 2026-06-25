import type { RiskLevel, SafetyResult } from "./analyze.ts"

const riskLabels: Record<RiskLevel, string> = {
  high: "High risk",
  caution: "Be careful",
  low: "Looks okay",
}

export function buildSafetyShareSummary(result: SafetyResult): string {
  const lines = [
    "AskSafe Home - safety summary",
    `Result: ${riskLabels[result.risk]}`,
    result.headline,
    "",
    `Safer next step: ${result.saferStep}`,
  ]

  if (result.clarification?.checks.length) {
    lines.push("", "Before acting, please help me check:")
    lines.push(...formatBullets(result.clarification.checks))
  }

  if (result.doNotYet.length) {
    lines.push("", "What not to do yet:")
    lines.push(...formatBullets(result.doNotYet.slice(0, 3)))
  }

  if (result.verify.length) {
    lines.push("", "How to verify safely:")
    lines.push(...formatBullets(result.verify.slice(0, 3)))
  }

  lines.push("", "Nothing is shared unless I choose to share it.")

  return lines.join("\n")
}

function formatBullets(items: string[]): string[] {
  return items.map((item) => `- ${item}`)
}