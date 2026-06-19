import { NextResponse } from "next/server"
import { handleSupportEventRequest } from "@/lib/server/support-event-route"
import { checkEventApiRateLimit } from "@/lib/server/rate-limit"

export async function POST(request: Request) {
  const rateLimit = checkEventApiRateLimit(request, "support-events")
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

  const response = await handleSupportEventRequest(payload)
  return NextResponse.json(response.body, { status: response.status })
}
