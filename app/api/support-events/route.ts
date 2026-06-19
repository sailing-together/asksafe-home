import { NextResponse } from "next/server"
import { handleSupportEventRequest } from "@/lib/server/support-event-route"

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

  const response = await handleSupportEventRequest(payload)
  return NextResponse.json(response.body, { status: response.status })
}
