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
