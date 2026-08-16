import test from "node:test"
import assert from "node:assert/strict"
import { SendEmailCommand } from "@aws-sdk/client-sesv2"
import { sendSetupCode } from "./setup-email.ts"

test("sendSetupCode returns not configured when no email provider is enabled", async () => {
  const result = await sendSetupCode(
    { email: "margaret@example.com", code: "123456" },
    { env: {} },
  )

  assert.deepEqual(result, { ok: false, reason: "email-not-configured" })
})

test("sendSetupCode supports console mode for local development", async () => {
  const messages: string[] = []
  const previousInfo = console.info
  console.info = (message?: unknown) => {
    messages.push(String(message))
  }

  try {
    const result = await sendSetupCode(
      { email: "margaret@example.com", code: "123456" },
      { env: { ASKSAFE_SETUP_EMAIL_MODE: "console" } },
    )

    assert.deepEqual(result, { ok: true })
    assert.equal(messages.length, 1)
    assert.equal(messages[0].includes("margaret@example.com"), true)
    assert.equal(messages[0].includes("123456"), true)
  } finally {
    console.info = previousInfo
  }
})

test("sendSetupCode returns not configured when SES sender settings are incomplete", async () => {
  const result = await sendSetupCode(
    { email: "margaret@example.com", code: "123456" },
    {
      env: {
        ASKSAFE_SETUP_EMAIL_PROVIDER: "ses",
        AWS_REGION: "ap-southeast-2",
      },
    },
  )

  assert.deepEqual(result, { ok: false, reason: "email-not-configured" })
})

test("sendSetupCode sends a plain text setup code through SES", async () => {
  const commands: SendEmailCommand[] = []
  const client = {
    async send(command: SendEmailCommand) {
      commands.push(command)
      return {}
    },
  }

  const result = await sendSetupCode(
    { email: "margaret@example.com", code: "654321" },
    {
      env: {
        ASKSAFE_SETUP_EMAIL_PROVIDER: "ses",
        ASKSAFE_SETUP_EMAIL_FROM: "noreply@asksafe.ai",
        AWS_REGION: "ap-southeast-2",
      },
      client,
    },
  )

  assert.deepEqual(result, { ok: true })
  assert.equal(commands.length, 1)
  assert.deepEqual(commands[0].input.Destination, {
    ToAddresses: ["margaret@example.com"],
  })
  assert.equal(commands[0].input.FromEmailAddress, "noreply@asksafe.ai")
  assert.equal(commands[0].input.Content?.Simple?.Subject?.Data, "Your AskSafe setup code")
  assert.equal(
    commands[0].input.Content?.Simple?.Body?.Text?.Data?.includes("654321"),
    true,
  )
  assert.equal(commands[0].input.Content?.Simple?.Body?.Html, undefined)
})

test("sendSetupCode returns email-send-failed when SES rejects delivery", async () => {
  const client = {
    async send() {
      throw new Error("SES rejected the request")
    },
  }

  const result = await sendSetupCode(
    { email: "margaret@example.com", code: "123456" },
    {
      env: {
        ASKSAFE_SETUP_EMAIL_PROVIDER: "ses",
        ASKSAFE_SETUP_EMAIL_FROM: "noreply@asksafe.ai",
        AWS_REGION: "ap-southeast-2",
      },
      client,
    },
  )

  assert.deepEqual(result, { ok: false, reason: "email-send-failed" })
})
