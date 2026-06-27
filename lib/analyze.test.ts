import test from "node:test"
import assert from "node:assert/strict"
import { analyze } from "./analyze.ts"

test("includes structured risk signals from the safety rules engine", () => {
  const result = analyze(
    "my daughter asks me to send her 2000 AUD from a video call",
    "video",
    ["pay"],
  )

  assert.equal(result.risk, "high")
  assert.equal(
    result.riskSignals.some((signal) => signal.id === "family-money-request"),
    true,
  )
  assert.equal(
    result.riskSignals.some((signal) => signal.id === "payment-request"),
    true,
  )
})

test("includes trusted scam pattern and source ids in analysis results", () => {
  const result = analyze(
    "Your parcel is waiting. Pay a small redelivery fee at this link today.",
    "message",
    ["link", "pay"],
  )

  assert.equal(result.risk, "high")
  assert.equal(result.scamTypeIds.includes("delivery-parcel"), true)
  assert.equal(result.sourceIds.includes("scamwatch-types"), true)
})

test("uses context-specific result copy for family money video requests", () => {
  const result = analyze(
    "my daughter asks me to send her 2000 AUD from a video call",
    "video",
    ["pay"],
  )

  assert.equal(result.risk, "high")
  assert.match(result.headline, /pause before sending money/i)
  assert.match(result.why, /someone close to you/i)
  assert.match(result.why, /video call/i)
  assert.match(result.why, /confirm/i)
  assert.doesNotMatch(result.why, /common sign of a scam/i)
})

test("adds concrete checks for a thin family money request", () => {
  const result = analyze("my daughter asks me for money", "video", ["pay"])

  assert.deepEqual(result.clarification?.checks, [
    "How did they contact you?",
    "Is this a new number, account, or chat?",
    "How much money do they want, and how do they want it sent?",
    "Can you contact them using a saved number or account you already trust?",
  ])
})

test("adds clarification for a thin family money request", () => {
  const result = analyze("my daughter asks me for money", "video", ["pay"])

  assert.equal(result.risk, "high")
  assert.deepEqual(result.clarification, {
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
  })
})

test("uses family-money safer step for family payment requests", () => {
  const result = analyze("my daughter asks me for money", "video", ["pay"])

  assert.equal(result.risk, "high")
  assert.match(result.saferStep, /pause before paying/i)
  assert.match(result.saferStep, /number or account you already know/i)
  assert.doesNotMatch(result.saferStep, /stop here for now/i)
})

test("uses family-money specific not-yet actions", () => {
  const result = analyze(
    "my daughter asks me to send 2000 AUD from a video call",
    "video",
    ["pay"],
  )

  assert.deepEqual(result.doNotYet, [
    "Don't send money until you confirm through a saved number or account",
    "Don't rely on the face, voice, or video call alone",
    "Don't use a new number, link, or account they gave you in this request",
    "Don't keep the request secret if it feels rushed or unusual",
  ])
})

test("adds trusted phrase guidance for family money requests", () => {
  const result = analyze(
    "my daughter asks me for money from a video call",
    "video",
    ["pay"],
  )

  assert.equal(result.risk, "high")
  assert.equal(
    result.verify.some((step) =>
      /question only your family would know/i.test(step),
    ),
    true,
  )
  assert.equal(
    result.verify.some((step) => /saved number|already trust/i.test(step)),
    true,
  )
  assert.equal(
    result.verify.some((step) => /do not enter or save/i.test(step)),
    true,
  )
})

test("adds clarification for a vague payment request", () => {
  const result = analyze("someone asked me to pay", "money", ["pay"])

  assert.equal(result.risk, "high")
  assert.deepEqual(result.clarification, {
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
  })
})

test("uses non-accusatory guidance for a vague payment request", () => {
  const result = analyze("someone asked me for money", "money", [])

  assert.equal(result.risk, "high")
  assert.match(result.headline, /pause before paying/i)
  assert.match(result.why, /need more information/i)
  assert.match(result.why, /verify/i)
  assert.doesNotMatch(result.why, /common sign of a scam/i)
})
test("does not add clarification for a hard-stop code request", () => {
  const result = analyze("they asked me for my one-time code", "message", ["code"])

  assert.equal(result.risk, "high")
  assert.equal(result.clarification, undefined)
  assert.match(result.saferStep, /don't reply|stop here|do not/i)
})

test("does not add clarification for low-risk input", () => {
  const result = analyze("my dentist reminder says my appointment is tomorrow", "message", [])

  assert.equal(result.risk, "low")
  assert.equal(result.clarification, undefined)
})
