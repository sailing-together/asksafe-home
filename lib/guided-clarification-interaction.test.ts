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
    helperText: "You can answer this, or see the safer next step now.",
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
    helperText: "You can answer this, or see the safer next step now.",
    reason:
      "The request involves payment, but the person and payment method still need checking.",
  })
})

test("after a vague payment clarification, gives payment pause guidance", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "someone asked me to pay\nit says I should transfer money today",
    category: "money",
    requests: ["pay"],
    hasAskedClarification: true,
  })

  assert.deepEqual(interaction, {
    type: "acknowledgement",
    text:
      "Pause before paying. Use a trusted channel you already know to confirm who is asking and whether the payment is expected.",
  })
})

test("after the user answers a family money clarification, gives trusted callback guidance", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "my daughter asked me for money\nvideo call, she needs 2000 AUD",
    category: "video",
    requests: ["pay"],
    hasAskedClarification: true,
  })

  assert.deepEqual(interaction, {
    type: "acknowledgement",
    text:
      "Pause before sending money. Contact them back using a saved number or account you already trust, then ask a question only your family would know.",
  })
})

test("after family money clarification, prompts trusted callback instead of a generic acknowledgement", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "my daughter asked me for money on video call\nshe needs 2000 AUD today",
    category: "video",
    requests: ["pay"],
    hasAskedClarification: true,
  })

  assert.deepEqual(interaction, {
    type: "acknowledgement",
    text:
      "Pause before sending money. Contact them back using a saved number or account you already trust, then ask a question only your family would know.",
  })
})

test("after a repeated family money detail, avoids repeating the same generic acknowledgement", () => {
  const interaction = getGuidedClarificationInteraction({
    message: "my daughter asked me for money\nmy daughter asked me for money again",
    category: "video",
    requests: ["pay"],
    hasAskedClarification: true,
  })

  assert.equal(interaction.type, "acknowledgement")
  assert.notEqual(
    interaction.text,
    "Thank you. I have enough to show the safer next step.",
  )
  assert.match(interaction.text, /saved number|already trust|family would know/i)
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
    text: "This is enough to pause. I'll show the safer next step now.",
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
    text: "This is enough to pause. I'll show the safer next step now.",
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
    text: "This is enough to pause. I'll show the safer next step now.",
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
    text: "Thanks. I'll show the safer next step now.",
  })
})
