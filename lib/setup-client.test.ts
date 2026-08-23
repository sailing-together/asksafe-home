import test from "node:test"
import assert from "node:assert/strict"
import {
  getSavedSetup,
  requestSetupCode,
  saveSetup,
  signOutSetup,
  verifySetupCode,
  type SupportSetupPayload,
} from "./setup-client.ts"

test("requestSetupCode posts to the setup code endpoint", async () => {
  let request: { url: string; init: RequestInit } | undefined
  const result = await requestSetupCode("margaret@example.com", {
    fetch: async (url, init) => {
      request = { url: String(url), init: init ?? {} }
      return jsonResponse(202, { ok: true })
    },
  })

  assert.deepEqual(result, { ok: true })
  assert.equal(request?.url, "/api/setup/request-code")
  assert.equal(request?.init.method, "POST")
  assert.equal(request?.init.credentials, "same-origin")
  assert.equal(request?.init.body, JSON.stringify({ email: "margaret@example.com" }))
})

test("verifySetupCode posts the OTP and keeps the session cookie", async () => {
  let credentials: RequestCredentials | undefined
  const result = await verifySetupCode("margaret@example.com", "123456", {
    fetch: async (_url, init) => {
      credentials = init?.credentials
      return jsonResponse(200, {
        ok: true,
        setup: null,
        signedInEmail: "margaret@example.com",
      })
    },
  })

  assert.deepEqual(result, {
    ok: true,
    setup: null,
    signedIn: true,
    signedInEmail: "margaret@example.com",
  })
  assert.equal(credentials, "same-origin")
})

test("verifySetupCode consumes an existing setup snapshot atomically", async () => {
  const result = await verifySetupCode("margaret@example.com", "123456", {
    fetch: async () =>
      jsonResponse(200, {
        ok: true,
        setup: {
          yourName: "Margaret",
          email: "margaret@example.com",
          phone: "",
          usingFor: "self",
          trustedName: "Sarah",
          relationship: "Daughter",
          trustedEmail: "sarah@example.com",
          trustedPhone: "+61 400 000 000",
          trustedContactNeedsUpdate: false,
        },
        signedInEmail: "margaret@example.com",
      }),
  })

  assert.equal(result.ok, true)
  if (!result.ok) throw new Error("expected verification success")
  assert.equal(result.setup?.trustedName, "Sarah")
  assert.equal(result.setup?.trustedEmail, "sarah@example.com")
  assert.equal(result.signedInEmail, "margaret@example.com")
})

test("getSavedSetup returns null when the user is not signed in", async () => {
  const result = await getSavedSetup({
    fetch: async () => jsonResponse(401, { ok: false, reason: "not-signed-in" }),
  })

  assert.deepEqual(result, {
    ok: true,
    setup: null,
    signedIn: false,
    signedInEmail: "",
  })
})

test("getSavedSetup returns the verified sign-in email for incomplete setup", async () => {
  const result = await getSavedSetup({
    fetch: async () =>
      jsonResponse(200, {
        ok: true,
        setup: null,
        signedInEmail: "margaret@example.com",
      }),
  })

  assert.deepEqual(result, {
    ok: true,
    setup: null,
    signedIn: true,
    signedInEmail: "margaret@example.com",
  })
})

test("saveSetup persists setup through the setup endpoint", async () => {
  const setup: SupportSetupPayload = {
    yourName: "Margaret",
    email: "margaret@example.com",
    phone: "",
    usingFor: "self",
    trustedName: "Sarah",
    relationship: "Daughter",
    trustedEmail: "",
    trustedPhone: "",
    trustedContactNeedsUpdate: true,
  }

  let body: BodyInit | null | undefined
  const result = await saveSetup(setup, {
    fetch: async (_url, init) => {
      body = init?.body
      return jsonResponse(200, { ok: true, setup })
    },
  })

  assert.deepEqual(result, { ok: true, setup })
  assert.equal(body, JSON.stringify(setup))
})

test("signOutSetup posts to the sign-out endpoint", async () => {
  let url = ""
  const result = await signOutSetup({
    fetch: async (input) => {
      url = String(input)
      return jsonResponse(200, { ok: true })
    },
  })

  assert.deepEqual(result, { ok: true })
  assert.equal(url, "/api/setup/sign-out")
})

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}
