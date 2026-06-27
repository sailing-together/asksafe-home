import test from "node:test"
import assert from "node:assert/strict"

import {
  buildInitialSituationMessages,
  splitDraftMessageIntoDetails,
} from "./situation-input-state.ts"

test("splitDraftMessageIntoDetails keeps submitted detail turns", () => {
  assert.deepEqual(
    splitDraftMessageIntoDetails(
      "My daughter asked for money\n2000 AUD by bank transfer",
    ),
    ["My daughter asked for money", "2000 AUD by bank transfer"],
  )
})

test("buildInitialSituationMessages restores prior details as user bubbles", () => {
  const messages = buildInitialSituationMessages("video", [
    "My daughter asked for money",
    "2000 AUD by bank transfer",
  ])

  assert.equal(messages.some((message) => message.role === "assistant"), true)
  assert.deepEqual(
    messages
      .filter((message) => message.role === "user")
      .map((message) => message.text),
    ["My daughter asked for money", "2000 AUD by bank transfer"],
  )
  assert.equal(
    messages.at(-1)?.text,
    "You can add more detail, or choose the safer next step when you're ready.",
  )
})