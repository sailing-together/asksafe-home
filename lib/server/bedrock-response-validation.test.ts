import test from "node:test"
import assert from "node:assert/strict"

import {
  validateBedrockExplanationResponse,
  type ValidatedBedrockExplanation,
} from "./bedrock-response-validation.ts"
import type { BedrockAssistPayload } from "./bedrock-explanation.ts"

const payload: BedrockAssistPayload = {
  category: "money",
  requests: ["pay"],
  risk: "high",
  riskSignalIds: ["urgent-pressure"],
  sourceIds: ["scamwatch-stop-check-protect"],
  saferStep: "Pause before paying.",
  doNotYet: ["Do not send money yet."],
  why: "This includes payment pressure.",
  verify: ["Contact the person using a saved number."],
  situationSummary: "My daughter asks for money urgently.",
}

const validExplanation: ValidatedBedrockExplanation = {
  saferNextStep: "Pause before paying and contact your daughter using a saved number.",
  why: "This request involves urgent pressure to send money.",
  verificationSteps: [
    "Do not use contact details from the message.",
    "Call your daughter using a number you already trust.",
  ],
  trustedSupportSummary:
    "I received an urgent money request and want help checking it safely.",
}

test("validateBedrockExplanationResponse accepts a bounded valid response", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify(validExplanation),
    payload,
  )

  assert.deepEqual(result, {
    valid: true,
    explanation: validExplanation,
  })
})

test("validateBedrockExplanationResponse accepts JSON wrapped in a model code fence", () => {
  const result = validateBedrockExplanationResponse(
    ["```json", JSON.stringify(validExplanation), "```"].join("\n"),
    payload,
  )

  assert.deepEqual(result, {
    valid: true,
    explanation: validExplanation,
  })
})

test("validateBedrockExplanationResponse rejects invalid JSON", () => {
  const result = validateBedrockExplanationResponse("{not json", payload)

  assert.deepEqual(result, {
    valid: false,
    reason: "invalid_json",
  })
})

test("validateBedrockExplanationResponse rejects unsupported fields", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      riskLevel: "low",
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: false,
    reason: "invalid_shape",
    detail: "unsupported_keys",
  })
})

test("validateBedrockExplanationResponse rejects oversized copy", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      why: "x".repeat(900),
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: false,
    reason: "invalid_shape",
    detail: "missing_or_invalid_required_text",
  })
})

test("validateBedrockExplanationResponse keeps the first three verification steps", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      verificationSteps: ["One", "Two", "Three", "Four"],
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: true,
    explanation: {
      ...validExplanation,
      verificationSteps: ["One", "Two", "Three"],
    },
  })
})

test("validateBedrockExplanationResponse rejects output that weakens money warnings", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      saferNextStep: "You can send the money now.",
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: false,
    reason: "safety_invariant_violation",
  })
})

test("validateBedrockExplanationResponse rejects requests for sensitive details", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      saferNextStep:
        "Ask them for the full bank account number and one-time code before you decide.",
      why: "This helps confirm the payment.",
      verificationSteps: ["Ask for their bank details."],
      trustedSupportSummary: "I need to share a code to confirm this.",
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: false,
    reason: "safety_invariant_violation",
  })
})

test("validateBedrockExplanationResponse rejects certainty overclaims", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      saferNextStep: "This is definitely your daughter and the request is safe.",
      why: "The video call proves it is real.",
      verificationSteps: ["Send the money."],
      trustedSupportSummary: "AskSafe confirmed this is genuine.",
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: false,
    reason: "safety_invariant_violation",
  })
})

test("validateBedrockExplanationResponse rejects suspicious-channel verification", () => {
  const result = validateBedrockExplanationResponse(
    JSON.stringify({
      ...validExplanation,
      saferNextStep: "Reply to the message and use the phone number they sent.",
      why: "That will verify the request.",
      verificationSteps: ["Use the contact details in the message."],
      trustedSupportSummary: "I should call the number from the message.",
    }),
    payload,
  )

  assert.deepEqual(result, {
    valid: false,
    reason: "safety_invariant_violation",
  })
})

test("validateBedrockExplanationResponse accepts official-channel verification wording", () => {
  const explanation: ValidatedBedrockExplanation = {
    saferNextStep:
      "Pause before paying and contact the person using a number you already trust.",
    why:
      "A money request should be checked through another channel before you act.",
    verificationSteps: [
      "Do not use contact details from the message.",
      "Call the person using a saved number.",
      "Ask whether they really sent the request.",
    ],
    trustedSupportSummary:
      "I received a money request and want help checking it safely.",
  }

  const result = validateBedrockExplanationResponse(
    JSON.stringify(explanation),
    payload,
  )

  assert.deepEqual(result, {
    valid: true,
    explanation,
  })
})
