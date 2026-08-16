import { NextResponse } from "next/server"
import { handleSignOutSetupRequest } from "@/lib/server/setup-route"

export async function POST() {
  const result = handleSignOutSetupRequest()
  const response = NextResponse.json(result.body, { status: result.status })

  response.cookies.set(result.clearCookie.name, result.clearCookie.value, {
    path: result.clearCookie.path,
    maxAge: result.clearCookie.maxAge,
  })

  return response
}
