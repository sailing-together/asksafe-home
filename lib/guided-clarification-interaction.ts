import { analyze, type Category, type RequestType } from "./analyze.ts"

export type GuidedClarificationInteraction =
  | {
      type: "clarification"
      question: string
      helperText: string
      reason: string
    }
  | {
      type: "acknowledgement"
      text: string
    }
  | {
      type: "hard-stop"
      text: string
    }

export type GuidedClarificationInteractionInput = {
  message: string
  category: Category
  requests: RequestType[]
  hasAskedClarification: boolean
}

const CLARIFICATION_HELPER_TEXT =
  "You can answer this, or choose the safer next step now."

const READY_ACKNOWLEDGEMENT =
  "Thank you. I have enough to show the safer next step."

const HARD_STOP_ACKNOWLEDGEMENT =
  "I have enough to show the safer next step."

const HARD_STOP_SIGNAL_IDS = new Set([
  "code-request",
  "remote-access",
  "personal-details",
])

export function getGuidedClarificationInteraction({
  message,
  category,
  requests,
  hasAskedClarification,
}: GuidedClarificationInteractionInput): GuidedClarificationInteraction {
  const result = analyze(message, category, requests)

  if (hasHardStopSignal(result.riskSignals)) {
    return {
      type: "hard-stop",
      text: HARD_STOP_ACKNOWLEDGEMENT,
    }
  }

  if (hasAskedClarification) {
    return {
      type: "acknowledgement",
      text: READY_ACKNOWLEDGEMENT,
    }
  }

  if (result.clarification?.needed) {
    return {
      type: "clarification",
      question: result.clarification.question,
      helperText: CLARIFICATION_HELPER_TEXT,
      reason: result.clarification.reason,
    }
  }

  return {
    type: "acknowledgement",
    text: READY_ACKNOWLEDGEMENT,
  }
}

function hasHardStopSignal(
  riskSignals: Array<{ id: string; severity: "high" | "caution" }>,
): boolean {
  return riskSignals.some((signal) => HARD_STOP_SIGNAL_IDS.has(signal.id))
}
