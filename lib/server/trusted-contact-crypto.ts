import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const ASSOCIATED_DATA = Buffer.from("asksafe-home:trusted-contact:v1", "utf8")

export type EncryptedTrustedContactValue = {
  version: "v1"
  iv: string
  ciphertext: string
  tag: string
}

export function encryptTrustedContactValue(
  value: string,
  secret: string,
): EncryptedTrustedContactValue {
  const key = readEncryptionKey(secret)
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  cipher.setAAD(ASSOCIATED_DATA)
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])

  return {
    version: "v1",
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
  }
}

export function decryptTrustedContactValue(
  value: EncryptedTrustedContactValue,
  secret: string,
): string {
  const key = readEncryptionKey(secret)
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(value.iv, "base64url"))
  decipher.setAAD(ASSOCIATED_DATA)
  decipher.setAuthTag(Buffer.from(value.tag, "base64url"))

  return Buffer.concat([
    decipher.update(Buffer.from(value.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}

function readEncryptionKey(secret: string): Buffer {
  const key = Buffer.from(secret, "base64")
  if (key.byteLength !== 32) {
    throw new Error("trusted contact encryption secret must decode to 32 bytes")
  }
  return key
}
