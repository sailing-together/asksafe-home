import test from "node:test"
import assert from "node:assert/strict"

import { analyze, type Category, type RequestType, type SafetyResult } from "./analyze.ts"
import type { RiskSignalId } from "./safety-rules.ts"

type GuidanceScenario = {
  name: string
  message: string
  category: Category
  requests: RequestType[]
  expectedRisk: SafetyResult["risk"]
  requiredSignalIds: RiskSignalId[]
  mustMention: RegExp[]
  mustNotMention?: RegExp[]
  needsClarification?: boolean
}

const scenarios: GuidanceScenario[] = [
  {
    name: "vague money request asks for context before payment",
    message: "someone asked me for money",
    category: "money",
    requests: [],
    expectedRisk: "high",
    requiredSignalIds: ["payment-request"],
    mustMention: [/pause before paying/i, /need more information/i, /verify/i],
    mustNotMention: [/common sign of a scam/i],
    needsClarification: true,
  },
  {
    name: "daughter video call money request avoids certainty and recommends saved contact",
    message: "My daughter asked me on a video call to send 2000 AUD today.",
    category: "video",
    requests: ["pay"],
    expectedRisk: "high",
    requiredSignalIds: ["family-money-request", "payment-request", "video-call"],
    mustMention: [/pause before sending money/i, /saved number|saved account|already trust/i],
    mustNotMention: [/prove|definitely|confirmed/i],
    needsClarification: true,
  },
  {
    name: "bank link message protects codes and official channels",
    message:
      "My bank text says my account is locked and I must click a link to verify my code.",
    category: "message",
    requests: ["link", "code"],
    expectedRisk: "high",
    requiredSignalIds: ["link-request", "code-request", "payment-request"],
    mustMention: [/don't reply|stop here|do not/i, /one-time codes|codes|passwords/i],
    needsClarification: false,
  },
  {
    name: "one-time code request is a hard stop",
    message: "Someone asked me to read out the six digit verification code sent to my phone.",
    category: "message",
    requests: ["code"],
    expectedRisk: "high",
    requiredSignalIds: ["code-request"],
    mustMention: [/don't reply|stop here|do not/i, /one-time codes|codes|passwords/i],
    needsClarification: false,
  },
  {
    name: "remote support request blocks install and screen sharing",
    message:
      "A caller says my computer is hacked and wants me to install AnyDesk and share my screen.",
    category: "caller",
    requests: ["install", "screen"],
    expectedRisk: "high",
    requiredSignalIds: ["remote-access"],
    mustMention: [/do not install|don't install/i, /share your screen/i],
    needsClarification: false,
  },
]

for (const scenario of scenarios) {
  test(`guidance scenario: ${scenario.name}`, () => {
    const result = analyze(scenario.message, scenario.category, scenario.requests)
    const combinedGuidance = [
      result.headline,
      result.saferStep,
      result.why,
      ...result.doNotYet,
      ...result.verify,
    ].join("\n")
    const signalIds = result.riskSignals.map((signal) => signal.id)

    assert.equal(result.risk, scenario.expectedRisk)
    for (const signalId of scenario.requiredSignalIds) {
      assert.equal(signalIds.includes(signalId), true, `missing ${signalId}`)
    }
    for (const pattern of scenario.mustMention) {
      assert.match(combinedGuidance, pattern)
    }
    for (const pattern of scenario.mustNotMention ?? []) {
      assert.doesNotMatch(combinedGuidance, pattern)
    }
    assert.equal(result.clarification?.needed ?? false, scenario.needsClarification ?? false)
  })
}