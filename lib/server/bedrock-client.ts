import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type BedrockRuntimeClientConfig,
} from "@aws-sdk/client-bedrock-runtime"

import type { AskSafeBedrockConfig } from "./bedrock-env.ts"
import type { BedrockAssistPayload } from "./bedrock-explanation.ts"

type BedrockRuntimeLike = {
  send: (
    command: InvokeModelCommand,
    options?: { abortSignal?: AbortSignal },
  ) => Promise<{ body?: Uint8Array | string }>
}

type InvokeBedrockExplanationModelOptions = {
  config: AskSafeBedrockConfig
  promptPayload: BedrockAssistPayload
  client?: BedrockRuntimeLike
}

export class BedrockInvocationTimeoutError extends Error {
  constructor() {
    super("bedrock-timeout")
    this.name = "BedrockInvocationTimeoutError"
  }
}

export function createAskSafeBedrockRuntimeClient(
  config: BedrockRuntimeClientConfig = {},
): BedrockRuntimeClient {
  return new BedrockRuntimeClient(config)
}

export async function invokeBedrockExplanationModel({
  config,
  promptPayload,
  client = createAskSafeBedrockRuntimeClient(),
}: InvokeBedrockExplanationModelOptions): Promise<string> {
  const abortController = new AbortController()
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    const command = new InvokeModelCommand({
      modelId: config.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(
        JSON.stringify(buildClaudeMessagesRequest(config, promptPayload)),
      ),
    })

    const response = await Promise.race([
      client.send(command, {
        abortSignal: abortController.signal,
      }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          abortController.abort()
          reject(new BedrockInvocationTimeoutError())
        }, config.timeoutMs)
      }),
    ])

    return extractTextFromBedrockResponse(response.body)
  } catch (error) {
    if (error instanceof BedrockInvocationTimeoutError || abortController.signal.aborted) {
      throw new BedrockInvocationTimeoutError()
    }
    throw error
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

function buildClaudeMessagesRequest(
  config: AskSafeBedrockConfig,
  promptPayload: BedrockAssistPayload,
) {
  return {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: config.maxOutputTokens,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: buildExplanationPrompt(promptPayload),
      },
    ],
  }
}

function buildExplanationPrompt(payload: BedrockAssistPayload): string {
  return [
    "You are helping rewrite a rules-derived safety result for an older adult.",
    "Do not decide whether the situation is real or fake.",
    "Do not change the risk level.",
    "Do not remove warnings.",
    "Do not ask for passwords, one-time codes, banking details, or identity documents.",
    "Use calm, plain language.",
    "Return only one valid JSON object.",
    "Do not wrap the JSON in markdown.",
    "Do not include any extra keys.",
    "Do not omit any required key.",
    "Required keys: saferNextStep, why, verificationSteps, trustedSupportSummary.",
    "Each required text value must be a non-empty string.",
    "verificationSteps must be an array of 1 to 3 non-empty strings.",
    "JSON shape:",
    '{"saferNextStep":"string","why":"string","verificationSteps":["string"],"trustedSupportSummary":"string"}',
    "",
    "Rules-derived payload:",
    JSON.stringify(payload),
  ].join("\n")
}

function extractTextFromBedrockResponse(body: Uint8Array | string | undefined): string {
  if (!body) return ""

  const decodedBody = typeof body === "string" ? body : new TextDecoder().decode(body)
  const parsed = JSON.parse(decodedBody) as { content?: Array<{ text?: string }> }

  return parsed.content?.find((item) => typeof item.text === "string")?.text ?? ""
}
