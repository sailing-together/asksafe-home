import test from "node:test"
import assert from "node:assert/strict"
import { redactSensitiveTextForBedrock } from "./bedrock-redaction.ts"

test("redactSensitiveTextForBedrock removes common secrets before model calls", () => {
  const redacted = redactSensitiveTextForBedrock(
    "Email me at margaret@example.com or call 0412 345 678. My code is 123456 and my card is 4111 1111 1111 1111.",
  )

  assert.equal(redacted.includes("margaret@example.com"), false)
  assert.equal(redacted.includes("0412 345 678"), false)
  assert.equal(redacted.includes("123456"), false)
  assert.equal(redacted.includes("4111 1111 1111 1111"), false)
  assert.match(redacted, /\[email removed\]/)
  assert.match(redacted, /\[phone number removed\]/)
  assert.match(redacted, /\[one-time code removed\]/)
  assert.match(redacted, /\[card number removed\]/)
})

test("redactSensitiveTextForBedrock trims repeated whitespace", () => {
  assert.equal(
    redactSensitiveTextForBedrock("Please   send\n\n money   now"),
    "Please send money now",
  )
})
