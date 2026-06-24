import test from "node:test"
import assert from "node:assert/strict"

import { getGuidedClarificationInteraction } from "./guided-clarification-interaction.ts"

test("asks one clarification for a thin family money request", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "my daughter asked me for money",
    category: "video",
    requests: ["pay"],
    hasAskedClarification: false,
  })

  assert.deepEqual(interaction, {
    type: "clarification",
    question:
      "Before you decide, check one thing: how did they contact you, and how do they want the money sent?",
    helperText: "You can answer this, or choose the safer next step now.",
    reason: "A money request from someone close should be verified another way before you act.",
  })
})

test("asks one clarification for a vague payment request", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "someone asked me to pay",
    category: "money",
    requests: ["pay"],
    hasAskedClarification: false,
  })

  assert.deepEqual(interaction, {
    type: "clarification",
    question:
      "Before you decide, check one thing: who is asking, and how do they want you to pay?",
    helperText: "You can answer this, or choose the safer next step now.",
    reason:
      "The request involves payment, but the person and payment method still need checking.",
  })
})

test("does not ask a second clarification after the user answers", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "my daughter asked me for money\nvideo call, she needs 2000 AUD",
    category: "video",
    requests: ["pay"],
    hasAskedClarification: true,
  })

  assert.deepEqual(interaction, {
    type: "acknowledgement",
    text: "Thank you. I have enough to show the safer next step.",
  })
})

test("skips clarification for a one-time code hard stop", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "they asked me for my one-time code",
    category: "message",
    requests: ["code"],
    hasAskedClarification: false,
  })

  assert.deepEqual(interaction, {
    type: "hard-stop",
    text: "I have enough to show the safer next step.",
  })
})

test("skips clarification for an install-app hard stop", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "the caller asked me to install an app",
    category: "caller",
    requests: ["install"],
    hasAskedClarification: false,
  })

  assert.deepEqual(interaction, {
    type: "hard-stop",
    text: "I have enough to show the safer next step.",
  })
})

test("skips clarification for a screen-share hard stop", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "they want me to share my screen",
    category: "video",
    requests: ["screen"],
    hasAskedClarification: false,
  })

  assert.deepEqual(interaction, {
    type: "hard-stop",
    text: "I have enough to show the safer next step.",
  })
})

test("does not ask clarification for low-risk appointment context", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "my dentist reminder says my appointment is tomorrow",
    category: "message",
    requests: [],
    hasAskedClarification: false,
  })

  assert.deepEqual(interaction, {
    type: "acknowledgement",
    text: "Thank you. I have enough to show the safer next step.",
  })
})
