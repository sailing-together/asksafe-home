import test from "node:test"
import assert from "node:assert/strict"

import {
  getCategoryOptionGroups,
  getSituationPrompt,
  getSituationStartMessages,
} from "./entry-copy.ts"

test("category step gives a direct unsure entry path", () => {
  const groups = getCategoryOptionGroups()
  const directOption = groups.standard.find((option) => option.value === "other")

  assert.deepEqual(directOption, {
    value: "other",
    label: "Not sure yet",
    hint: "Just tell AskSafe what happened",
    iconName: "help",
  })
})

test("other category prompt invites natural language first", () => {
  assert.equal(
    getSituationPrompt("other"),
    "Tell AskSafe what happened. You can start anywhere, even if you're not sure what kind of situation it is.",
  )
})

test("other category assistant message avoids forcing a category", () => {
  assert.deepEqual(getSituationStartMessages("other"), [
    "Tell AskSafe what happened. You can start anywhere, even if you're not sure what kind of situation it is.",
    "Type or use voice in your own words. If you know what they want you to do, choose a chip below. If not, you can leave it as Not sure.",
  ])
})

test("video category keeps scenario-specific guidance", () => {
  assert.match(getSituationPrompt("video"), /video call or chat/i)
  assert.match(getSituationStartMessages("video")[1], /choose any action that fits/i)
})
