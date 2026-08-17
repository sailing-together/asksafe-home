import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto"
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb"
import type { AskSafeAwsConfig } from "./aws-env.ts"

type AskSafeDynamoClientResult =
  | {
      ok: true
      config: AskSafeAwsConfig
      documentClient: DynamoDBDocumentClient
    }
  | {
      ok: false
      missing: string[]
    }

type ClientProvider = () =>
  | AskSafeDynamoClientResult
  | Promise<AskSafeDynamoClientResult>

type SetupAuthOptions = {
  clientProvider?: ClientProvider
}

export type SetupResult =
  | { ok: true; id: string }
  | { skipped: true; reason: "missing-aws-config"; missing: string[] }
  | { ok: false; reason: "write-failed" | "missing-setup-tables" }

export type SetupCookie = {
  name: "asksafe_setup_session"
  value: string
  httpOnly: true
  secure: true
  sameSite: "lax"
  path: "/"
  maxAge: number
}

export type SetupSessionIdentity = {
  userId: string
  email: string
}

export type SetupChallengeItem = {
  userId: string
  itemType: "otpChallenge"
  emailHash: string
  otpHash: string
  createdAt: string
  expiresAt: number
  usedAt?: string
}

export type SetupProfileInput = {
  userId: string
  yourName: string
  email: string
  phone: string
  usingFor: "self" | "other"
  trustedName: string
  relationship: string
  trustedEmail: string
  trustedPhone: string
  supportCode: string
  now?: Date
}

export type SupportSetup = {
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

type UserItem = {
  userId: string
  itemType: "user"
  emailHash: string
  phoneHash?: string
  displayName: string
  usingFor: "self" | "other"
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

type HouseholdItem = {
  householdId: string
  userId: string
  trustedName: string
  relationship: string
  trustedEmailHash?: string
  trustedPhoneHash?: string
  supportCode?: string
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

type VerifySetupCodeInput = {
  email: string
  code: string
  otpSecret: string
  sessionSecret: string
  now?: Date
  userIdProvider?: () => string
}

type VerifySetupCodeResult =
  | { ok: true; userId: string; session: SetupCookie }
  | {
      ok: false
      reason:
        | "invalid-email"
        | "invalid-code"
        | "invalid-or-expired-code"
        | "missing-aws-config"
        | "missing-setup-tables"
        | "write-failed"
    }

type LoadSetupResult =
  | { ok: true; setup: SupportSetup | null }
  | { ok: false; reason: "missing-aws-config" | "missing-setup-tables" | "read-failed" }

const SESSION_COOKIE_NAME = "asksafe_setup_session"
const OTP_TTL_SECONDS = 10 * 60
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

export function createOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0")
}

export function buildSetupChallengeItem(input: {
  email: string
  code: string
  secret: string
  now?: Date
  challengeId?: string
}): SetupChallengeItem {
  const now = input.now ?? new Date()
  const challengeId = input.challengeId ?? randomUUID()

  return {
    userId: `otp_${challengeId}`,
    itemType: "otpChallenge",
    emailHash: hashContact(input.email),
    otpHash: hashOtp(input.email, input.code, input.secret),
    createdAt: now.toISOString(),
    expiresAt: Math.floor((now.getTime() + OTP_TTL_SECONDS * 1_000) / 1_000),
  }
}

export function buildSetupSessionCookie(input: {
  userId: string
  email: string
  secret: string
  now?: Date
}): SetupCookie {
  const now = input.now ?? new Date()
  const payload = {
    userId: input.userId,
    email: normalizeContact(input.email),
    exp: Math.floor((now.getTime() + SESSION_TTL_SECONDS * 1_000) / 1_000),
  }
  const payloadValue = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(payloadValue, input.secret)

  return {
    name: SESSION_COOKIE_NAME,
    value: `${payloadValue}.${signature}`,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  }
}

export function readSetupSessionIdentity(
  sessionValue: string | undefined,
  secret: string,
  now: Date = new Date(),
): SetupSessionIdentity | null {
  if (!sessionValue) return null

  const [payloadValue, signature] = sessionValue.split(".")
  if (!payloadValue || !signature) return null
  if (!safeEqual(signature, signValue(payloadValue, secret))) return null

  try {
    const payload = JSON.parse(base64UrlDecode(payloadValue)) as {
      userId?: unknown
      email?: unknown
      exp?: unknown
    }

    if (typeof payload.userId !== "string") return null
    if (typeof payload.exp !== "number") return null
    if (payload.exp <= Math.floor(now.getTime() / 1_000)) return null

    return {
      userId: payload.userId,
      email: typeof payload.email === "string" ? normalizeContact(payload.email) : "",
    }
  } catch {
    return null
  }
}

export function readSetupSessionUserId(
  sessionValue: string | undefined,
  secret: string,
  now: Date = new Date(),
): string | null {
  return readSetupSessionIdentity(sessionValue, secret, now)?.userId ?? null
}

export async function saveSetupChallenge(
  input: { email: string; code: string; secret: string; now?: Date },
  options: SetupAuthOptions = {},
): Promise<SetupResult> {
  if (!isLikelyEmail(input.email)) return { ok: false, reason: "write-failed" }

  const runtime = await getRuntime(options.clientProvider)
  if (!runtime.ok) {
    return { skipped: true, reason: "missing-aws-config", missing: runtime.missing }
  }

  const tables = getSetupTables(runtime.config)
  if (!tables.ok) return { ok: false, reason: "missing-setup-tables" }

  try {
    await runtime.documentClient.send(
      new PutCommand({
        TableName: tables.users,
        Item: buildSetupChallengeItem(input),
      }),
    )

    return { ok: true, id: hashContact(input.email) }
  } catch {
    return { ok: false, reason: "write-failed" }
  }
}

export async function verifySetupCode(
  input: VerifySetupCodeInput,
  options: SetupAuthOptions = {},
): Promise<VerifySetupCodeResult> {
  if (!isLikelyEmail(input.email)) return { ok: false, reason: "invalid-email" }
  if (!/^\d{6}$/.test(input.code.trim())) return { ok: false, reason: "invalid-code" }

  const runtime = await getRuntime(options.clientProvider)
  if (!runtime.ok) return { ok: false, reason: "missing-aws-config" }

  const tables = getSetupTables(runtime.config)
  if (!tables.ok) return { ok: false, reason: "missing-setup-tables" }

  const now = input.now ?? new Date()
  const emailHash = hashContact(input.email)
  const expectedOtpHash = hashOtp(input.email, input.code, input.otpSecret)

  try {
    const queryResult = await runtime.documentClient.send(
      new QueryCommand({
        TableName: tables.users,
        IndexName: "emailHash-index",
        KeyConditionExpression: "emailHash = :emailHash",
        ExpressionAttributeValues: {
          ":emailHash": emailHash,
        },
      }),
    )

    const items = (queryResult.Items ?? []) as Array<SetupChallengeItem | UserItem>
    const challenge = items
      .filter(isSetupChallengeItem)
      .filter((item) => !item.usedAt)
      .filter((item) => item.expiresAt > Math.floor(now.getTime() / 1_000))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .find((item) => safeEqual(item.otpHash, expectedOtpHash))

    if (!challenge) return { ok: false, reason: "invalid-or-expired-code" }

    const existingUser = items.find(isUserItem)
    const userId = existingUser?.userId ?? input.userIdProvider?.() ?? `usr_${randomUUID()}`
    const createdAt = existingUser?.createdAt ?? now.toISOString()

    await runtime.documentClient.send(
      new PutCommand({
        TableName: tables.users,
        Item: {
          userId,
          itemType: "user",
          emailHash,
          phoneHash: existingUser?.phoneHash,
          displayName: existingUser?.displayName ?? "",
          usingFor: existingUser?.usingFor ?? "self",
          createdAt,
          updatedAt: now.toISOString(),
          schemaVersion: 1,
        } satisfies UserItem,
      }),
    )

    await runtime.documentClient.send(
      new PutCommand({
        TableName: tables.users,
        Item: {
          ...challenge,
          usedAt: now.toISOString(),
        },
      }),
    )

    return {
      ok: true,
      userId,
      session: buildSetupSessionCookie({
        userId,
        email: input.email,
        secret: input.sessionSecret,
        now,
      }),
    }
  } catch {
    return { ok: false, reason: "write-failed" }
  }
}

export async function saveSetupProfile(
  input: SetupProfileInput,
  options: SetupAuthOptions = {},
): Promise<SetupResult> {
  const runtime = await getRuntime(options.clientProvider)
  if (!runtime.ok) {
    return { skipped: true, reason: "missing-aws-config", missing: runtime.missing }
  }

  const tables = getSetupTables(runtime.config)
  if (!tables.ok) return { ok: false, reason: "missing-setup-tables" }

  const now = input.now ?? new Date()
  const householdId = householdIdForUser(input.userId)

  const userItem: UserItem = {
    userId: input.userId,
    itemType: "user",
    emailHash: hashContact(input.email),
    phoneHash: hashOptionalContact(input.phone),
    displayName: input.yourName.trim(),
    usingFor: input.usingFor,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    schemaVersion: 1,
  }

  const householdItem: HouseholdItem = {
    householdId,
    userId: input.userId,
    trustedName: input.trustedName.trim(),
    relationship: input.relationship.trim(),
    trustedEmailHash: hashOptionalContact(input.trustedEmail),
    trustedPhoneHash: hashOptionalContact(input.trustedPhone),
    supportCode: input.supportCode.trim() || undefined,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    schemaVersion: 1,
  }

  try {
    await runtime.documentClient.send(
      new PutCommand({
        TableName: tables.users,
        Item: userItem,
      }),
    )

    await runtime.documentClient.send(
      new PutCommand({
        TableName: tables.households,
        Item: householdItem,
      }),
    )

    return { ok: true, id: input.userId }
  } catch {
    return { ok: false, reason: "write-failed" }
  }
}

export async function loadSetupFromSession(
  userId: string,
  options: SetupAuthOptions = {},
): Promise<LoadSetupResult> {
  const runtime = await getRuntime(options.clientProvider)
  if (!runtime.ok) return { ok: false, reason: "missing-aws-config" }

  const tables = getSetupTables(runtime.config)
  if (!tables.ok) return { ok: false, reason: "missing-setup-tables" }

  try {
    const userResult = await runtime.documentClient.send(
      new GetCommand({
        TableName: tables.users,
        Key: { userId },
      }),
    )

    if (!userResult.Item || !isUserItem(userResult.Item)) {
      return { ok: true, setup: null }
    }

    if (!userResult.Item.displayName.trim()) {
      return { ok: true, setup: null }
    }

    const householdResult = await runtime.documentClient.send(
      new GetCommand({
        TableName: tables.households,
        Key: { householdId: householdIdForUser(userId) },
      }),
    )

    const household = isHouseholdItem(householdResult.Item)
      ? householdResult.Item
      : undefined

    return {
      ok: true,
      setup: {
        yourName: userResult.Item.displayName,
        email: "",
        phone: "",
        usingFor: userResult.Item.usingFor,
        trustedName: household?.trustedName ?? "",
        relationship: household?.relationship ?? "",
        trustedEmail: "",
        trustedPhone: "",
        code: household?.supportCode ?? "",
      },
    }
  } catch {
    return { ok: false, reason: "read-failed" }
  }
}

export function hashContact(value: string): string {
  return createHmac("sha256", "asksafe-contact-hash-v1")
    .update(normalizeContact(value))
    .digest("hex")
}

function hashOptionalContact(value: string): string | undefined {
  const normalized = normalizeContact(value)
  return normalized.length > 0 ? hashContact(normalized) : undefined
}

function hashOtp(email: string, code: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${normalizeContact(email)}:${code.trim()}`)
    .digest("hex")
}

function normalizeContact(value: string): string {
  return value.trim().toLowerCase()
}

function isLikelyEmail(value: string): boolean {
  const normalized = normalizeContact(value)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

function getSetupTables(config: AskSafeAwsConfig):
  | { ok: true; users: string; households: string }
  | { ok: false } {
  if (!config.tables.users || !config.tables.households) return { ok: false }
  return {
    ok: true,
    users: config.tables.users,
    households: config.tables.households,
  }
}

async function getRuntime(clientProvider?: ClientProvider): Promise<AskSafeDynamoClientResult> {
  if (clientProvider) return clientProvider()

  const { getAskSafeDynamoClient } = await import("./dynamodb.ts")
  return getAskSafeDynamoClient()
}

function signValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url")
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url")
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8")
}

function householdIdForUser(userId: string): string {
  return `hld_${userId}`
}

function isSetupChallengeItem(value: unknown): value is SetupChallengeItem {
  return (
    isRecord(value) &&
    value.itemType === "otpChallenge" &&
    typeof value.userId === "string" &&
    typeof value.emailHash === "string" &&
    typeof value.otpHash === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.expiresAt === "number"
  )
}

function isUserItem(value: unknown): value is UserItem {
  return (
    isRecord(value) &&
    value.itemType === "user" &&
    typeof value.userId === "string" &&
    typeof value.emailHash === "string" &&
    typeof value.displayName === "string" &&
    (value.usingFor === "self" || value.usingFor === "other")
  )
}

function isHouseholdItem(value: unknown): value is HouseholdItem {
  return (
    isRecord(value) &&
    typeof value.householdId === "string" &&
    typeof value.userId === "string" &&
    typeof value.trustedName === "string" &&
    typeof value.relationship === "string"
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
