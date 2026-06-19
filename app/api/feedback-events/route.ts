import { NextResponse } from "next/server"
import { handleFeedbackEventRequest } from "@/lib/server/feedback-event-route"

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

  const response = await handleFeedbackEventRequest(payload)
  return NextResponse.json(response.body, { status: response.status })
}
