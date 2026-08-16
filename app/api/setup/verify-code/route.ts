import { NextResponse } from "next/server"
import { checkEventApiRateLimit } from "@/lib/server/rate-limit"
import { handleVerifySetupCode } from "@/lib/server/setup-route"

export async function POST(request: Request) {
  const rateLimit = checkEventApiRateLimit(request, "setup-verify-code")
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

  const result = await handleVerifySetupCode(payload)
  const response = NextResponse.json(result.body, { status: result.status })

  if ("cookie" in result) {
    response.cookies.set(result.cookie.name, result.cookie.value, {
      httpOnly: result.cookie.httpOnly,
      secure: result.cookie.secure,
      sameSite: result.cookie.sameSite,
      path: result.cookie.path,
      maxAge: result.cookie.maxAge,
    })
  }

  return response
}
