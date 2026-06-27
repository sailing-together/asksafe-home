import { NextResponse } from "next/server"

import { handleAnalyzeRequest } from "@/lib/server/analyze-route"
import { checkAnalyzeApiRateLimit } from "@/lib/server/rate-limit"

export async function POST(request: Request) {
  const rateLimit = checkAnalyzeApiRateLimit(request)
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

  const response = await handleAnalyzeRequest(payload)
  return NextResponse.json(response.body, { status: response.status })
}
