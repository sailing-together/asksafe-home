export type SupportSetupPayload = {
  yourName: string
  email: string
  phone: string
  usingFor: "self" | "other"
  trustedName: string
  relationship: string
  trustedEmail: string
  trustedPhone: string
  code: string
}

type FetchFn = typeof fetch

type ClientOptions = {
  fetch?: FetchFn
}

type BasicResult =
  | { ok: true }
  | {
      ok: false
      reason:
        | "invalid-payload"
        | "invalid-email"
        | "invalid-code"
        | "invalid-or-expired-code"
        | "email-not-configured"
        | "email-send-failed"
        | "not-signed-in"
        | "rate-limited"
        | "request-failed"
    }

type SavedSetupResult =
  | {
      ok: true
      setup: SupportSetupPayload | null
      signedIn: boolean
      signedInEmail: string
    }
  | { ok: false; reason: "request-failed" }

export async function requestSetupCode(
  email: string,
  options: ClientOptions = {},
): Promise<BasicResult> {
  return postJson("/api/setup/request-code", { email: email.trim() }, options)
}

export async function verifySetupCode(
  email: string,
  code: string,
  options: ClientOptions = {},
): Promise<BasicResult> {
  return postJson("/api/setup/verify-code", { email: email.trim(), code: code.trim() }, options)
}

export async function getSavedSetup(
  options: ClientOptions = {},
): Promise<SavedSetupResult> {
  const fetchImpl = options.fetch ?? fetch

  try {
    const response = await fetchImpl("/api/setup/me", {
      method: "GET",
      credentials: "same-origin",
    })

    if (response.status === 401) {
      return { ok: true, setup: null, signedIn: false, signedInEmail: "" }
    }

    const body = await readJson(response)
    if (response.ok && isRecord(body) && body.ok === true) {
      return {
        ok: true,
        setup: isSupportSetup(body.setup) ? body.setup : null,
        signedIn: true,
        signedInEmail:
          typeof body.signedInEmail === "string" ? body.signedInEmail : "",
      }
    }
  } catch {
    // Return below.
  }

  return { ok: false, reason: "request-failed" }
}

export async function saveSetup(
  setup: SupportSetupPayload,
  options: ClientOptions = {},
): Promise<BasicResult> {
  return putJson("/api/setup/me", setup, options)
}

export async function signOutSetup(
  options: ClientOptions = {},
): Promise<BasicResult> {
  return postJson("/api/setup/sign-out", {}, options)
}

async function postJson(
  url: string,
  payload: unknown,
  options: ClientOptions,
): Promise<BasicResult> {
  return sendJson(url, "POST", payload, options)
}

async function putJson(
  url: string,
  payload: unknown,
  options: ClientOptions,
): Promise<BasicResult> {
  return sendJson(url, "PUT", payload, options)
}

async function sendJson(
  url: string,
  method: "POST" | "PUT",
  payload: unknown,
  options: ClientOptions,
): Promise<BasicResult> {
  const fetchImpl = options.fetch ?? fetch

  try {
    const response = await fetchImpl(url, {
      method,
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    const body = await readJson(response)

    if (response.ok && isRecord(body) && body.ok === true) {
      return { ok: true }
    }

    if (isRecord(body) && typeof body.reason === "string") {
      return { ok: false, reason: mapReason(body.reason) }
    }
  } catch {
    // Return below.
  }

  return { ok: false, reason: "request-failed" }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return response.json()
  } catch {
    return null
  }
}

function mapReason(reason: string): Extract<BasicResult, { ok: false }>["reason"] {
  switch (reason) {
    case "invalid-payload":
    case "invalid-email":
    case "invalid-code":
    case "invalid-or-expired-code":
    case "email-not-configured":
    case "email-send-failed":
    case "not-signed-in":
    case "rate-limited":
      return reason
    default:
      return "request-failed"
  }
}

function isSupportSetup(value: unknown): value is SupportSetupPayload {
  return (
    isRecord(value) &&
    typeof value.yourName === "string" &&
    typeof value.email === "string" &&
    typeof value.phone === "string" &&
    (value.usingFor === "self" || value.usingFor === "other") &&
    typeof value.trustedName === "string" &&
    typeof value.relationship === "string" &&
    typeof value.trustedEmail === "string" &&
    typeof value.trustedPhone === "string" &&
    typeof value.code === "string"
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
