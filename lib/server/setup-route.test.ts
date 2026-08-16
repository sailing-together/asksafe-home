import test from "node:test"
import assert from "node:assert/strict"
import {
  handleGetSetupRequest,
  handleRequestSetupCode,
  handleSaveSetupRequest,
  handleSignOutSetupRequest,
  handleVerifySetupCode,
} from "./setup-route.ts"
import type { SetupCookie, SupportSetup } from "./setup-auth.ts"

const validSession: SetupCookie = {
  name: "asksafe_setup_session",
  value: "signed-session",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
}

test("handleRequestSetupCode sends an email OTP without returning the code", async () => {
  const deliveries: Array<{ email: string; code: string }> = []

  const response = await handleRequestSetupCode(
    { email: "margaret@example.com" },
    {
      codeProvider: () => "123456",
      otpSecret: "otp-secret",
      saveSetupChallenge: async () => ({ ok: true, id: "challenge" }),
      sendSetupCode: async (input) => {
        deliveries.push(input)
        return { ok: true }
      },
    },
  )

  assert.deepEqual(response, {
    status: 202,
    body: { ok: true },
  })
  assert.deepEqual(deliveries, [{ email: "margaret@example.com", code: "123456" }])
  assert.equal(JSON.stringify(response).includes("123456"), false)
})

test("handleRequestSetupCode returns not configured when email delivery is missing", async () => {
  const response = await handleRequestSetupCode(
    { email: "margaret@example.com" },
    {
      codeProvider: () => "123456",
      otpSecret: "otp-secret",
      saveSetupChallenge: async () => ({ ok: true, id: "challenge" }),
      sendSetupCode: async () => ({ ok: false, reason: "email-not-configured" }),
    },
  )

  assert.deepEqual(response, {
    status: 503,
    body: { ok: false, reason: "email-not-configured" },
  })
})

test("handleVerifySetupCode returns a session cookie for a valid code", async () => {
  const response = await handleVerifySetupCode(
    { email: "margaret@example.com", code: "123456" },
    {
      otpSecret: "otp-secret",
      sessionSecret: "session-secret",
      verifySetupCode: async () => ({
        ok: true,
        userId: "usr_123",
        session: validSession,
      }),
    },
  )

  assert.deepEqual(response, {
    status: 200,
    body: { ok: true },
    cookie: validSession,
  })
})

test("handleGetSetupRequest loads setup from a valid session", async () => {
  const setup: SupportSetup = {
    yourName: "Margaret",
    email: "",
    phone: "",
    usingFor: "self",
    trustedName: "Sarah",
    relationship: "Daughter",
    trustedEmail: "",
    trustedPhone: "",
    code: "SAFE-1234",
  }

  const response = await handleGetSetupRequest("signed-session", {
    readSetupSessionUserId: () => "usr_123",
    loadSetupFromSession: async () => ({ ok: true, setup }),
  })

  assert.deepEqual(response, {
    status: 200,
    body: { ok: true, setup },
  })
})

test("handleSaveSetupRequest saves setup for a valid session", async () => {
  const payload: SupportSetup = {
    yourName: "Margaret",
    email: "margaret@example.com",
    phone: "",
    usingFor: "self",
    trustedName: "Sarah",
    relationship: "Daughter",
    trustedEmail: "",
    trustedPhone: "",
    code: "SAFE-1234",
  }

  const response = await handleSaveSetupRequest("signed-session", payload, {
    readSetupSessionUserId: () => "usr_123",
    saveSetupProfile: async (input) => {
      assert.equal(input.userId, "usr_123")
      assert.equal(input.yourName, "Margaret")
      return { ok: true, id: "usr_123" }
    },
  })

  assert.deepEqual(response, {
    status: 200,
    body: { ok: true },
  })
})

test("handleSignOutSetupRequest clears the session cookie", () => {
  assert.deepEqual(handleSignOutSetupRequest(), {
    status: 200,
    body: { ok: true },
    clearCookie: {
      name: "asksafe_setup_session",
      value: "",
      path: "/",
      maxAge: 0,
    },
  })
})
