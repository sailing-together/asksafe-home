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

