import { NextResponse } from "next/server"
import { checkEventApiRateLimit } from "@/lib/server/rate-limit"
import {
  handleGetSetupRequest,
  handleSaveSetupRequest,
} from "@/lib/server/setup-route"

const sessionCookieName = "asksafe_setup_session"

export async function GET(request: Request) {
  const response = await handleGetSetupRequest(readCookie(request, sessionCookieName))
  return NextResponse.json(response.body, { status: response.status })
}

export async function PUT(request: Request) {
  const rateLimit = checkEventApiRateLimit(request, "setup-save")
  if (!rateLimit.ok) {
    return NextResponse.json(rateLimit.body, {
      status: rateLimit.status,
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid-payload" },
      { status: 400 },
    )
  }

  const response = await handleSaveSetupRequest(
    readCookie(request, sessionCookieName),
    payload,
  )
  return NextResponse.json(response.body, { status: response.status })
}

function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return undefined

  const cookies = cookieHeader.split(";").map((part) => part.trim())
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`))
  if (!match) return undefined

  return decodeURIComponent(match.slice(name.length + 1))
}
