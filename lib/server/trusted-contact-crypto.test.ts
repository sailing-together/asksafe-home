import assert from "node:assert/strict"
import test from "node:test"
import {
  decryptTrustedContactValue,
  encryptTrustedContactValue,
} from "./trusted-contact-crypto.ts"

const encryptionSecret = Buffer.alloc(32, 7).toString("base64")

test("trusted contact values round-trip through authenticated encryption", () => {
  const encrypted = encryptTrustedContactValue("sarah@example.com", encryptionSecret)

  assert.equal(encrypted.version, "v1")
  assert.notEqual(JSON.stringify(encrypted).includes("sarah@example.com"), true)
  assert.equal(
    decryptTrustedContactValue(encrypted, encryptionSecret),
    "sarah@example.com",
  )
})

test("trusted contact encryption rejects the wrong key and tampered values", () => {
  const encrypted = encryptTrustedContactValue("0411 111 111", encryptionSecret)
  const anotherSecret = Buffer.alloc(32, 8).toString("base64")

  assert.throws(() => decryptTrustedContactValue(encrypted, anotherSecret))
  const replacement = encrypted.ciphertext[0] === "A" ? "B" : "A"
  assert.throws(() =>
    decryptTrustedContactValue(
      { ...encrypted, ciphertext: `${replacement}${encrypted.ciphertext.slice(1)}` },
      encryptionSecret,
    ),
  )
})
