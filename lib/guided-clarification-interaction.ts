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

const FAMILY_MONEY_ACKNOWLEDGEMENT =
  "Pause before sending money. Contact them back using a saved number or account you already trust, then ask a question only your family would know."

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
    if (hasSignal(result.riskSignals, "family-money-request")) {
      return {
        type: "acknowledgement",
        text: FAMILY_MONEY_ACKNOWLEDGEMENT,
      }
    }

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

function hasSignal(
  riskSignals: Array<{ id: string; severity: "high" | "caution" }>,
  signalId: string,
): boolean {
  return riskSignals.some((signal) => signal.id === signalId)
}
