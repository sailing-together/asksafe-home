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

test("adds clarification for a thin family money request", () => {
  const result = analyze("my daughter asks me for money", "video", ["pay"])

  assert.equal(result.risk, "high")
  assert.deepEqual(result.clarification, {
    needed: true,
    question:
      "Before you decide, check one thing: how did they contact you, and how do they want the money sent?",
    reason: "A money request from someone close should be verified another way before you act.",
  })
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
  })
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
