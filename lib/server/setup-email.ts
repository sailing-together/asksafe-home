export type SendSetupCodeInput = {
  email: string
  code: string
}

export type SendSetupCodeResult =
  | { ok: true }
  | { ok: false; reason: "email-not-configured" | "email-send-failed" }

export async function sendSetupCode(
  input: SendSetupCodeInput,
): Promise<SendSetupCodeResult> {
  const mode = process.env.ASKSAFE_SETUP_EMAIL_MODE?.trim().toLowerCase()

  if (mode === "console") {
    console.info(`AskSafe setup code for ${input.email}: ${input.code}`)
    return { ok: true }
  }

  return { ok: false, reason: "email-not-configured" }
}
