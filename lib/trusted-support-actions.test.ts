import assert from "node:assert/strict"
import test from "node:test"
import { getTrustedSupportActions } from "./trusted-support-actions.ts"

test("trusted support exposes direct call and email actions when consented contacts exist", () => {
  const actions = getTrustedSupportActions({
    trustedName: "Cynthia",
    trustedPhone: "0400 123 456",
    trustedEmail: "cynthia@example.com",
    trustedContactNeedsUpdate: false,
  })

  assert.deepEqual(actions, [
    { kind: "call", label: "Call Cynthia", href: "tel:0400123456" },
    { kind: "email", label: "Email Cynthia", href: "mailto:cynthia@example.com" },
  ])
})

test("legacy trusted contacts request direct contact details instead of pretending they are actionable", () => {
  assert.deepEqual(
    getTrustedSupportActions({
      trustedName: "Cynthia",
      trustedPhone: "",
      trustedEmail: "",
      trustedContactNeedsUpdate: true,
    }),
    [{ kind: "add-contact-details", label: "Add Cynthia's contact details" }],
  )
})

test("people without a trusted contact are offered an optional setup action", () => {
  assert.deepEqual(getTrustedSupportActions(null), [
    { kind: "add-contact", label: "Add someone I trust" },
  ])
})
