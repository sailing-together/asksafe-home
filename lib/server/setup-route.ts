import {
  createOtpCode,
  loadSetupFromSession,
  readSetupSessionUserId,
  saveSetupChallenge,
  saveSetupProfile,
  verifySetupCode,
  type SetupCookie,
  type SetupResult,
  type SupportSetup,
} from "./setup-auth.ts"
import { sendSetupCode, type SendSetupCodeResult } from "./setup-email.ts"

type RequestSetupCodeResponse =
  | { status: 202; body: { ok: true } }
  | { status: 400; body: { ok: false; reason: "invalid-payload" | "invalid-email" } }
  | { status: 503; body: { ok: false; reason: "email-not-configured" } }
  | { status: 500; body: { ok: false; reason: "write-failed" | "email-send-failed" | "missing-aws-config" } }

type VerifySetupCodeResponse =
  | { status: 200; body: { ok: true }; cookie: SetupCookie }
  | {
      status: 400
      body: {
        ok: false
        reason: "invalid-payload" | "invalid-email" | "invalid-code" | "invalid-or-expired-code"
      }
    }
  | { status: 500; body: { ok: false; reason: "write-failed" | "missing-aws-config" | "missing-setup-tables" } }

type GetSetupResponse =
  | { status: 200; body: { ok: true; setup: SupportSetup | null } }
  | { status: 401; body: { ok: false; reason: "not-signed-in" } }
  | { status: 500; body: { ok: false; reason: "read-failed" | "missing-aws-config" | "missing-setup-tables" } }

type SaveSetupResponse =
  | { status: 200; body: { ok: true } }
  | { status: 400; body: { ok: false; reason: "invalid-payload" } }
  | { status: 401; body: { ok: false; reason: "not-signed-in" } }
  | { status: 500; body: { ok: false; reason: "write-failed" | "missing-aws-config" | "missing-setup-tables" } }

type SignOutSetupResponse = {
  status: 200
  body: { ok: true }
  clearCookie: { name: "asksafe_setup_session"; value: ""; path: "/"; maxAge: 0 }
}

type RequestSetupCodeOptions = {
  codeProvider?: () => string
  saveSetupChallenge?: typeof saveSetupChallenge
  sendSetupCode?: typeof sendSetupCode
  otpSecret?: string
}

type VerifySetupCodeOptions = {
  verifySetupCode?: typeof verifySetupCode
  otpSecret?: string
  sessionSecret?: string
}

type SessionOptions = {
  readSetupSessionUserId?: typeof readSetupSessionUserId
  sessionSecret?: string
}

type GetSetupOptions = SessionOptions & {
  loadSetupFromSession?: typeof loadSetupFromSession
}

type SaveSetupOptions = SessionOptions & {
  saveSetupProfile?: typeof saveSetupProfile
}

export async function handleRequestSetupCode(
  payload: unknown,
  options: RequestSetupCodeOptions = {},
): Promise<RequestSetupCodeResponse> {
  const email = parseEmailPayload(payload)
  if (!email) return { status: 400, body: { ok: false, reason: "invalid-payload" } }

  const code = options.codeProvider?.() ?? createOtpCode()
  const otpSecret = options.otpSecret ?? readRequiredSecret("ASKSAFE_OTP_SECRET")
  if (!otpSecret) return { status: 503, body: { ok: false, reason: "email-not-configured" } }

  const persist = options.saveSetupChallenge ?? saveSetupChallenge
  const saved = await persist({ email, code, secret: otpSecret })
  if ("skipped" in saved) return { status: 500, body: { ok: false, reason: "missing-aws-config" } }
  if (!saved.ok) return mapSetupSaveFailure(saved)

  const deliver = options.sendSetupCode ?? sendSetupCode
  const delivered = await deliver({ email, code })
  return mapSetupCodeDelivery(delivered)
}

export async function handleVerifySetupCode(
  payload: unknown,
  options: VerifySetupCodeOptions = {},
): Promise<VerifySetupCodeResponse> {
  const input = parseVerifyPayload(payload)
  if (!input) return { status: 400, body: { ok: false, reason: "invalid-payload" } }

  const otpSecret = options.otpSecret ?? readRequiredSecret("ASKSAFE_OTP_SECRET")
  const sessionSecret = options.sessionSecret ?? readRequiredSecret("ASKSAFE_SESSION_SECRET")
  if (!otpSecret || !sessionSecret) {
    return { status: 500, body: { ok: false, reason: "missing-aws-config" } }
  }

  const verify = options.verifySetupCode ?? verifySetupCode
  const result = await verify({ ...input, otpSecret, sessionSecret })

  if (result.ok) {
    return {
      status: 200,
      body: { ok: true },
      cookie: result.session,
    }
  }

  if (
    result.reason === "invalid-email" ||
    result.reason === "invalid-code" ||
    result.reason === "invalid-or-expired-code"
  ) {
    return { status: 400, body: { ok: false, reason: result.reason } }
  }

  return { status: 500, body: { ok: false, reason: result.reason } }
}

export async function handleGetSetupRequest(
  sessionCookie: string | undefined,
  options: GetSetupOptions = {},
): Promise<GetSetupResponse> {
  const userId = getSessionUserId(sessionCookie, options)
  if (!userId) return { status: 401, body: { ok: false, reason: "not-signed-in" } }

  const load = options.loadSetupFromSession ?? loadSetupFromSession
  const result = await load(userId)

  if (result.ok) {
    return { status: 200, body: { ok: true, setup: result.setup } }
  }

  return { status: 500, body: { ok: false, reason: result.reason } }
}

export async function handleSaveSetupRequest(
  sessionCookie: string | undefined,
  payload: unknown,
  options: SaveSetupOptions = {},
): Promise<SaveSetupResponse> {
  const userId = getSessionUserId(sessionCookie, options)
  if (!userId) return { status: 401, body: { ok: false, reason: "not-signed-in" } }

  const setup = parseSupportSetup(payload)
  if (!setup) return { status: 400, body: { ok: false, reason: "invalid-payload" } }

  const save = options.saveSetupProfile ?? saveSetupProfile
  const result = await save({
    userId,
    yourName: setup.yourName,
    email: setup.email,
    phone: setup.phone,
    usingFor: setup.usingFor,
    trustedName: setup.trustedName,
    relationship: setup.relationship,
    trustedEmail: setup.trustedEmail,
    trustedPhone: setup.trustedPhone,
    supportCode: setup.code,
  })

  if ("skipped" in result) {
    return { status: 500, body: { ok: false, reason: "missing-aws-config" } }
  }

  if (!result.ok) {
    return { status: 500, body: { ok: false, reason: result.reason } }
  }

  return { status: 200, body: { ok: true } }
}

export function handleSignOutSetupRequest(): SignOutSetupResponse {
  return {
    status: 200,
    body: { ok: true },
    clearCookie: {
      name: "asksafe_setup_session",
      value: "",
      path: "/",
      maxAge: 0,
    },
  }
}

function mapSetupCodeDelivery(result: SendSetupCodeResult): RequestSetupCodeResponse {
  if (result.ok) return { status: 202, body: { ok: true } }
  if (result.reason === "email-not-configured") {
    return { status: 503, body: { ok: false, reason: "email-not-configured" } }
  }
  return { status: 500, body: { ok: false, reason: "email-send-failed" } }
}

function mapSetupSaveFailure(result: Extract<SetupResult, { ok: false }>): RequestSetupCodeResponse {
  if (result.reason === "missing-setup-tables") {
    return { status: 500, body: { ok: false, reason: "write-failed" } }
  }

  return { status: 500, body: { ok: false, reason: "write-failed" } }
}

function getSessionUserId(sessionCookie: string | undefined, options: SessionOptions): string | null {
  if (options.readSetupSessionUserId) {
    return options.readSetupSessionUserId(
      sessionCookie,
      options.sessionSecret ?? "test-secret",
    )
  }

  const sessionSecret = options.sessionSecret ?? readRequiredSecret("ASKSAFE_SESSION_SECRET")
  if (!sessionSecret) return null
  return readSetupSessionUserId(sessionCookie, sessionSecret)
}

function parseEmailPayload(payload: unknown): string | null {
  if (!isRecord(payload)) return null
  if (typeof payload.email !== "string") return null
  const email = payload.email.trim()
  return isLikelyEmail(email) ? email : null
}

function parseVerifyPayload(payload: unknown): { email: string; code: string } | null {
  if (!isRecord(payload)) return null
  if (typeof payload.email !== "string") return null
  if (typeof payload.code !== "string") return null

  const email = payload.email.trim()
  const code = payload.code.trim()
  if (!isLikelyEmail(email)) return null
  if (!/^\d{6}$/.test(code)) return null

  return { email, code }
}

function parseSupportSetup(payload: unknown): SupportSetup | null {
  if (!isRecord(payload)) return null
  if (typeof payload.yourName !== "string" || payload.yourName.trim().length < 1) {
    return null
  }
  if (typeof payload.email !== "string" || !isLikelyEmail(payload.email)) return null
  if (payload.usingFor !== "self" && payload.usingFor !== "other") return null

  return {

    yourName: payload.yourName.trim(),
    email: payload.email.trim(),
    phone: typeof payload.phone === "string" ? payload.phone.trim() : "",
    usingFor: payload.usingFor,
    trustedName: typeof payload.trustedName === "string" ? payload.trustedName.trim() : "",
    relationship: typeof payload.relationship === "string" ? payload.relationship.trim() : "",
    trustedEmail:
      typeof payload.trustedEmail === "string" && payload.trustedEmail.trim().length > 0
        ? payload.trustedEmail.trim()
        : "",
    trustedPhone:
      typeof payload.trustedPhone === "string" ? payload.trustedPhone.trim() : "",
    code: typeof payload.code === "string" ? payload.code.trim() : "",
  }
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase())
}

function readRequiredSecret(name: string): string | null {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
