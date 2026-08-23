import test from "node:test"
import assert from "node:assert/strict"
import {
  getSetupSessionResponseHeaders,
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

test("setup session responses are private and never cached", () => {
  assert.deepEqual(getSetupSessionResponseHeaders(), {
    "Cache-Control": "private, no-store, max-age=0",
    Vary: "Cookie",
  })
})

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
        setup: null,
      }),
    },
  )

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      setup: null,
      signedInEmail: "margaret@example.com",
    },
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
    trustedContactNeedsUpdate: true,
  }

  const response = await handleGetSetupRequest("signed-session", {
    readSetupSessionIdentity: () => ({
      userId: "usr_123",
      email: "margaret@example.com",
    }),
    loadSetupFromSession: async () => ({ ok: true, setup }),
  })

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      setup: { ...setup, email: "margaret@example.com" },
      signedInEmail: "margaret@example.com",
    },
  })
})

test("handleGetSetupRequest returns verified email for an incomplete setup", async () => {
  const response = await handleGetSetupRequest("signed-session", {
    readSetupSessionIdentity: () => ({
      userId: "usr_123",
      email: "margaret@example.com",
    }),
    loadSetupFromSession: async () => ({ ok: true, setup: null }),
  })

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      setup: null,
      signedInEmail: "margaret@example.com",
    },
  })
})

test("handleSaveSetupRequest saves setup for a valid session", async () => {
  const setup: SupportSetup = {
    yourName: "Margaret",
    email: "margaret@example.com",
    phone: "",
    usingFor: "self",
    trustedName: "Sarah",
    relationship: "Daughter",
    trustedEmail: "sarah@example.com",
    trustedPhone: "+61 400 000 000",
    trustedContactNeedsUpdate: false,
  }
  const payload = { ...setup, trustedContactConsent: true }

  const response = await handleSaveSetupRequest("signed-session", payload, {
    readSetupSessionIdentity: () => ({
      userId: "usr_123",
      email: "margaret@example.com",
    }),
    saveSetupProfile: async (input) => {
      assert.equal(input.userId, "usr_123")
      assert.equal(input.yourName, "Margaret")
      assert.equal(input.email, "margaret@example.com")
      assert.equal(input.trustedContactConsent, true)
      return { ok: true, id: "usr_123" }
    },
  })

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      setup,
    },
  })
})

test("handleSaveSetupRequest requires consent before storing trusted contact details", async () => {
  const response = await handleSaveSetupRequest(
    "signed-session",
    {
      yourName: "Margaret",
      email: "margaret@example.com",
      phone: "",
      usingFor: "self",
      trustedName: "Sarah",
      relationship: "Daughter",
      trustedEmail: "sarah@example.com",
      trustedPhone: "",
      trustedContactConsent: false,
    },
    {
      readSetupSessionIdentity: () => ({
        userId: "usr_123",
        email: "margaret@example.com",
      }),
    },
  )

  assert.deepEqual(response, {
    status: 400,
    body: { ok: false, reason: "trusted-contact-consent-required" },
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
