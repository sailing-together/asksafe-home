import { getSituationStartMessages } from "./entry-copy.ts"
import type { Category } from "./analyze.ts"

export type SituationChatMessage = {
  role: "assistant" | "user"
  text: string
}

export function splitDraftMessageIntoDetails(message: string): string[] {
  return message
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function buildInitialSituationMessages(
  category: Category,
  initialDetails: string[] = [],
): SituationChatMessage[] {
  const messages: SituationChatMessage[] = getSituationStartMessages(category).map(
    (text) => ({
      role: "assistant",
      text,
    }),
  )

  for (const detail of initialDetails) {
    messages.push({ role: "user", text: detail })
  }

  if (initialDetails.length > 0) {
    messages.push({
      role: "assistant",
      text: "You can add more detail, or choose the safer next step when you're ready.",
    })
  }

  return messages
}