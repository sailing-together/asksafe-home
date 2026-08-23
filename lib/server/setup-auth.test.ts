import test from "node:test"
import assert from "node:assert/strict"
import {
  buildSetupChallengeItem,
  buildSetupSessionCookie,
  loadSetupFromSession,
  readSetupSessionIdentity,
  saveSetupProfile,
  verifySetupCode,
  type SetupProfileInput,
} from "./setup-auth.ts"

test("buildSetupChallengeItem stores only hashed email and OTP", () => {
  const item = buildSetupChallengeItem({
    email: " Margaret@example.COM ",
    code: "123456",
    secret: "test-secret",
    now: new Date("2026-06-30T00:00:00.000Z"),
    challengeId: "challenge-123",
  })

  assert.equal(item.userId, "otp_challenge-123")
  assert.equal(item.itemType, "otpChallenge")
  assert.equal(item.emailHash.length, 64)
  assert.equal(item.otpHash.length, 64)
  assert.equal(item.createdAt, "2026-06-30T00:00:00.000Z")
  assert.equal(item.expiresAt, Math.floor(new Date("2026-06-30T00:10:00.000Z").getTime() / 1000))
  assert.equal(JSON.stringify(item).includes("Margaret"), false)
  assert.equal(JSON.stringify(item).includes("123456"), false)
})

test("buildSetupSessionCookie creates a verifiable signed session", () => {
  const cookie = buildSetupSessionCookie({
    userId: "usr_123",
    email: " Margaret@example.COM ",
    secret: "session-secret",
    now: new Date("2026-06-30T00:00:00.000Z"),
  })

  assert.equal(cookie.name, "asksafe_setup_session")
  assert.equal(cookie.httpOnly, true)
  assert.equal(cookie.sameSite, "lax")
  assert.equal(cookie.secure, true)
  assert.equal(cookie.maxAge, 60 * 60 * 24 * 30)
  assert.match(cookie.value, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  assert.deepEqual(
    readSetupSessionIdentity(
      cookie.value,
      "session-secret",
      new Date("2026-06-30T00:01:00.000Z"),
    ),
    { userId: "usr_123", email: "margaret@example.com" },
  )
})

test("verifySetupCode creates a user when a valid challenge exists", async () => {
  const calls: Record<string, unknown>[] = []
  const challenge = buildSetupChallengeItem({
    email: "margaret@example.com",
    code: "123456",
    secret: "otp-secret",
    now: new Date("2026-06-30T00:00:00.000Z"),
    challengeId: "challenge-123",
  })

  const documentClient = {
    send: async (command: { input: Record<string, unknown>; constructor: { name: string } }) => {
      calls.push({ command: command.constructor.name, ...command.input })

      if (command.constructor.name === "QueryCommand") {
        return { Items: [challenge] }
      }

      return {}
    },
  }

  const result = await verifySetupCode(
    {
      email: "margaret@example.com",
      code: "123456",
      otpSecret: "otp-secret",
      sessionSecret: "session-secret",
      now: new Date("2026-06-30T00:03:00.000Z"),
      userIdProvider: () => "usr_123",
    },
    {
      clientProvider: () => ({
        ok: true,
        config: {
          region: "ap-southeast-2",
          tables: {
            events: "events-table",
            feedback: "feedback-table",
            supportEvents: "support-events-table",
            users: "users-table",
            households: "households-table",
          },
        },
        documentClient: documentClient as never,
      }),
    },
  )

  assert.equal(result.ok, true)
  if (!result.ok) throw new Error("expected verification to succeed")

  assert.equal(result.userId, "usr_123")
  assert.equal(result.session.name, "asksafe_setup_session")
  assert.equal(calls.some((call) => call.command === "PutCommand" && call.TableName === "users-table"), true)
})

test("verifySetupCode rejects an expired challenge", async () => {
  const challenge = buildSetupChallengeItem({
    email: "margaret@example.com",
    code: "123456",
    secret: "otp-secret",
    now: new Date("2026-06-30T00:00:00.000Z"),
    challengeId: "challenge-123",
  })

  const documentClient = {
    send: async () => ({ Items: [challenge] }),
  }

  const result = await verifySetupCode(
    {
      email: "margaret@example.com",
      code: "123456",
      otpSecret: "otp-secret",
      sessionSecret: "session-secret",
      now: new Date("2026-06-30T00:11:00.000Z"),
    },
    {
      clientProvider: () => ({
        ok: true,
        config: {
          region: "ap-southeast-2",
          tables: {
            events: "events-table",
            feedback: "feedback-table",
            supportEvents: "support-events-table",
            users: "users-table",
            households: "households-table",
          },
        },
        documentClient: documentClient as never,
      }),
    },
  )

  assert.deepEqual(result, { ok: false, reason: "invalid-or-expired-code" })
})

test("saveSetupProfile writes user and household setup records", async () => {
  const calls: Record<string, unknown>[] = []
  const documentClient = {
    send: async (command: { input: Record<string, unknown>; constructor: { name: string } }) => {
      calls.push({ command: command.constructor.name, ...command.input })
      return {}
    },
  }

  const profile: SetupProfileInput = {
    userId: "usr_123",
    yourName: "Margaret",
    email: "margaret@example.com",
    phone: "0400000000",
    usingFor: "self",
    trustedName: "Sarah",
    relationship: "Daughter",
    trustedEmail: "sarah@example.com",
    trustedPhone: "0411111111",
    trustedContactConsent: true,
    now: new Date("2026-06-30T01:00:00.000Z"),
  }

  const result = await saveSetupProfile(profile, {
    trustedContactEncryptionSecret: Buffer.alloc(32, 3).toString("base64"),
    clientProvider: () => ({
      ok: true,
      config: {
        region: "ap-southeast-2",
        tables: {
          events: "events-table",
          feedback: "feedback-table",
          supportEvents: "support-events-table",
          users: "users-table",
          households: "households-table",
        },
      },
      documentClient: documentClient as never,
    }),
  })

  assert.deepEqual(result, { ok: true, id: "usr_123" })
  assert.equal(calls.length, 2)
  assert.equal(calls[0]?.TableName, "users-table")
  assert.equal(calls[1]?.TableName, "households-table")
  assert.equal(JSON.stringify(calls).includes("margaret@example.com"), false)
  assert.equal(JSON.stringify(calls).includes("sarah@example.com"), false)
  assert.equal(JSON.stringify(calls).includes("0400000000"), false)
})

test("saveSetupProfile encrypts trusted contact details for actionable support", async () => {
  const items = new Map<string, Record<string, unknown>>()
  const documentClient = {
    send: async (command: { input: Record<string, unknown>; constructor: { name: string } }) => {
      if (command.constructor.name === "PutCommand") {
        const item = command.input.Item as Record<string, unknown>
        const key = `${command.input.TableName}:${String(item.householdId ?? item.userId)}`
        items.set(key, item)
        return {}
      }

      if (command.constructor.name === "GetCommand") {
        const key = `${command.input.TableName}:${String((command.input.Key as Record<string, unknown>).userId ?? (command.input.Key as Record<string, unknown>).householdId)}`
        return { Item: items.get(key) }
      }

      return {}
    },
  }
  const options = {
    trustedContactEncryptionSecret: Buffer.alloc(32, 7).toString("base64"),
    clientProvider: () => ({
      ok: true as const,
      config: {
        region: "ap-southeast-2",
        tables: {
          events: "events-table",
          feedback: "feedback-table",
          supportEvents: "support-events-table",
          users: "users-table",
          households: "households-table",
        },
      },
      documentClient: documentClient as never,
    }),
  }

  const saved = await saveSetupProfile(
    {
      userId: "usr_456",
      yourName: "Margaret",
      email: "margaret@example.com",
      phone: "",
      usingFor: "self",
      trustedName: "Sarah",
      relationship: "Daughter",
      trustedEmail: "sarah@example.com",
      trustedPhone: "0411111111",
      trustedContactConsent: true,
    },
    options,
  )

  assert.deepEqual(saved, { ok: true, id: "usr_456" })
  assert.equal(JSON.stringify([...items.values()]).includes("sarah@example.com"), false)
  assert.equal(JSON.stringify([...items.values()]).includes("0411111111"), false)

  const loaded = await loadSetupFromSession("usr_456", options)
  assert.equal(loaded.ok, true)
  if (!loaded.ok || !loaded.setup) throw new Error("expected actionable trusted contact")
  assert.equal(loaded.setup.trustedEmail, "sarah@example.com")
  assert.equal(loaded.setup.trustedPhone, "0411111111")
  assert.equal(loaded.setup.trustedContactNeedsUpdate, false)
})

test("loadSetupFromSession returns saved user and household setup", async () => {
  const documentClient = {
    send: async (command: { input: Record<string, unknown>; constructor: { name: string } }) => {
      if (command.input.TableName === "users-table") {
        return {
          Item: {
            userId: "usr_123",
            itemType: "user",
            displayName: "Margaret",
            emailHash: "hash",
            phoneHash: "phone-hash",
            usingFor: "self",
          },
        }
      }

      return {
        Item: {
          householdId: "hld_usr_123",
          userId: "usr_123",
          trustedName: "Sarah",
          relationship: "Daughter",
          trustedEmailHash: "trusted-email-hash",
          trustedPhoneHash: "trusted-phone-hash",
          supportCode: "SAFE-1234",
        },
      }
    },
  }

  const result = await loadSetupFromSession("usr_123", {
    clientProvider: () => ({
      ok: true,
      config: {
        region: "ap-southeast-2",
        tables: {
          events: "events-table",
          feedback: "feedback-table",
          supportEvents: "support-events-table",
          users: "users-table",
          households: "households-table",
        },
      },
      documentClient: documentClient as never,
    }),
  })

  assert.equal(result.ok, true)
  if (!result.ok) throw new Error("expected setup to load")

  assert.deepEqual(result.setup, {
    yourName: "Margaret",
    email: "",
    phone: "",
    usingFor: "self",
    trustedName: "Sarah",
    relationship: "Daughter",
    trustedEmail: "",
    trustedPhone: "",
    trustedContactNeedsUpdate: true,
  })
})

test("loadSetupFromSession treats an OTP-only user as incomplete setup", async () => {
  const calls: string[] = []
  const documentClient = {
    send: async (command: { input: Record<string, unknown> }) => {
      calls.push(String(command.input.TableName))
      return {
        Item: {
          userId: "usr_123",
          itemType: "user",
          displayName: "",
          emailHash: "hash",
          usingFor: "self",
        },
      }
    },
  }

  const result = await loadSetupFromSession("usr_123", {
    clientProvider: () => ({
      ok: true,
      config: {
        region: "ap-southeast-2",
        tables: {
          events: "events-table",
          feedback: "feedback-table",
          supportEvents: "support-events-table",
          users: "users-table",
          households: "households-table",
        },
      },
      documentClient: documentClient as never,
    }),
  })

  assert.deepEqual(result, { ok: true, setup: null })
  assert.deepEqual(calls, ["users-table"])
})
