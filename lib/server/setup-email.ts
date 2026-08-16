import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"

export type SendSetupCodeInput = {
  email: string
  code: string
}

export type SendSetupCodeResult =
  | { ok: true }
  | { ok: false; reason: "email-not-configured" | "email-send-failed" }

type SetupEmailEnv = Partial<
  Pick<
    NodeJS.ProcessEnv,
    "ASKSAFE_SETUP_EMAIL_MODE" | "ASKSAFE_SETUP_EMAIL_PROVIDER" | "ASKSAFE_SETUP_EMAIL_FROM" | "AWS_REGION"
  >
>

type SetupEmailClient = {
  send(command: SendEmailCommand): Promise<unknown>
}

export type SendSetupCodeOptions = {
  env?: SetupEmailEnv
  client?: SetupEmailClient
}

export async function sendSetupCode(
  input: SendSetupCodeInput,
  options: SendSetupCodeOptions = {},
): Promise<SendSetupCodeResult> {
  const env = options.env ?? process.env
  const mode = env.ASKSAFE_SETUP_EMAIL_MODE?.trim().toLowerCase()
  const provider = env.ASKSAFE_SETUP_EMAIL_PROVIDER?.trim().toLowerCase()

  if (mode === "console") {
    console.info(`AskSafe setup code for ${input.email}: ${input.code}`)
    return { ok: true }
  }

  if (provider === "ses") {
    const fromAddress = env.ASKSAFE_SETUP_EMAIL_FROM?.trim()
    const region = env.AWS_REGION?.trim()

    if (!fromAddress || !region) {
      return { ok: false, reason: "email-not-configured" }
    }

    const client = options.client ?? new SESv2Client({ region })

    try {
      await client.send(
        new SendEmailCommand({
          FromEmailAddress: fromAddress,
          Destination: {
            ToAddresses: [input.email],
          },
          Content: {
            Simple: {
              Subject: {
                Data: "Your AskSafe setup code",
              },
              Body: {
                Text: {
                  Data: buildSetupCodeEmailText(input.code),
                },
              },
            },
          },
        }),
      )

      return { ok: true }
    } catch {
      return { ok: false, reason: "email-send-failed" }
    }
  }

  return { ok: false, reason: "email-not-configured" }
}

function buildSetupCodeEmailText(code: string) {
  return [
    `Your AskSafe setup code is ${code}.`,
    "",
    "This code expires soon. If you did not request it, you can ignore this email.",
    "",
    "AskSafe Home",
  ].join("\n")
}
