import { NextResponse } from "next/server"
import { handleSafetyEventRequest } from "@/lib/server/safety-event-route"

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid-payload" },
      { status: 400 },
    )
  }

  const response = await handleSafetyEventRequest(payload)
  return NextResponse.json(response.body, { status: response.status })
}