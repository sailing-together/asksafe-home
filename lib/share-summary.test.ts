import test from "node:test"
import assert from "node:assert/strict"

import { analyze } from "./analyze.ts"
import { buildSafetyShareSummary } from "./share-summary.ts"

test("builds a family-money safety summary with clarification checks", () => {
  const result = analyze("my daughter asks me for money", "video", ["pay"])

  const summary = buildSafetyShareSummary(result)

  assert.match(summary, /AskSafe Home - safety summary/)
  assert.match(summary, /Result: High risk/)
  assert.match(summary, /Pause before sending money/i)
  assert.match(summary, /Safer next step:/)
  assert.match(summary, /Before acting, please help me check:/)
  assert.match(summary, /How did they contact you\?/) 
  assert.match(summary, /Is this a new number, account, or chat\?/) 
  assert.match(summary, /What not to do yet:/)
  assert.match(summary, /Don't send any money/) 
  assert.match(summary, /How to verify safely:/)
  assert.match(summary, /saved number|already trust/i)
  assert.match(summary, /Nothing is shared unless I choose to share it\./)
})