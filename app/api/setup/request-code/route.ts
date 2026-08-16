import { NextResponse } from "next/server"
import { checkEventApiRateLimit } from "@/lib/server/rate-limit"
import { handleRequestSetupCode } from "@/lib/server/setup-route"

export async function POST(request: Request) {
  const rateLimit = checkEventApiRateLimit(request, "setup-request-code")
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

  const response = await handleRequestSetupCode(payload)
  return NextResponse.json(response.body, { status: response.status })
}
