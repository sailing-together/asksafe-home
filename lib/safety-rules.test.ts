import test from "node:test"
import assert from "node:assert/strict"
import { assessSafetyInput } from "./safety-rules.ts"

test("flags a family money request as high risk and asks for payment method", () => {
  const assessment = assessSafetyInput({
    message: "my daughter asks me to send her 2000 AUD from a video call",
    category: "video",
    requests: ["pay"],
  })

  assert.equal(assessment.riskLevel, "high")
  assert.deepEqual(
    assessment.riskSignals.map((signal) => signal.id).sort(),
    ["family-money-request", "payment-request", "video-call"],
  )
  assert.match(assessment.followUpQuestion, /how.*money.*sent/i)
  assert.equal(assessment.suggestedRequests.includes("pay"), true)
})

test("matches family emergency trusted scam pattern with source ids", () => {
  const assessment = assessSafetyInput({
    message: "Hi Mum, I broke my phone. Please send money urgently to this new account and do not call me.",
    category: "message",
    requests: [],
  })

  assert.equal(assessment.riskLevel, "high")
  assert.equal(assessment.scamTypeIds.includes("family-emergency"), true)
  assert.equal(assessment.sourceIds.includes("scamwatch-types"), true)
  assert.equal(assessment.sourceIds.includes("scamwatch-methods"), true)
  assert.match(assessment.saferNextStep, /call.*family.*saved/i)
})

test("matches parcel delivery fee trusted scam pattern with official-channel guidance", () => {
  const assessment = assessSafetyInput({
    message: "Your parcel is waiting. Pay a small redelivery fee at this link today.",
    category: "message",
    requests: ["link", "pay"],
  })

  assert.equal(assessment.riskLevel, "high")
  assert.equal(assessment.scamTypeIds.includes("delivery-parcel"), true)
  assert.equal(assessment.sourceIds.includes("scamwatch-types"), true)
  assert.match(assessment.saferNextStep, /official delivery app or website/i)
})

test("flags remote access requests as high risk with device guidance", () => {
  const assessment = assessSafetyInput({
    message: "the caller told me to install anydesk and share my screen",
    category: "caller",
    requests: ["install", "screen"],
  })

  assert.equal(assessment.riskLevel, "high")
  assert.equal(
    assessment.riskSignals.some((signal) => signal.id === "remote-access"),
    true,
  )
  assert.match(assessment.saferNextStep, /do not install|share your screen/i)
})

test("returns a lower-risk assessment when no pressure signals are present", () => {
  const assessment = assessSafetyInput({
    message: "my dentist sent a reminder for my appointment tomorrow",
    category: "message",
    requests: [],
  })

  assert.equal(assessment.riskLevel, "low")
  assert.deepEqual(assessment.riskSignals, [])
  assert.match(assessment.followUpQuestion, /anything still feels off/i)
})
