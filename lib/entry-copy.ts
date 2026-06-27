import type { Category } from "./analyze"

export type CategoryIconName =
  | "phone"
  | "message"
  | "money"
  | "door"
  | "online"
  | "video"
  | "help"

export type CategoryOptionCopy = {
  value: Category
  label: string
  hint: string
  iconName: CategoryIconName
}

const moneyOption: CategoryOptionCopy = {
  value: "money",
  label: "Money or payments",
  hint: "Asked to pay, transfer, or send money",
  iconName: "money",
}

const standardOptions: CategoryOptionCopy[] = [
  { value: "caller", label: "A phone call", hint: "Someone rang me", iconName: "phone" },
  { value: "message", label: "A text or email", hint: "A message I received", iconName: "message" },
  { value: "door", label: "Someone at the door", hint: "A visitor or knock", iconName: "door" },
  { value: "online", label: "Something online", hint: "A website or pop-up", iconName: "online" },
  {
    value: "video",
    label: "Video call or online chat",
    hint: "A video call, chat app, or social message",
    iconName: "video",
  },
  {
    value: "other",
    label: "Not sure yet",
    hint: "Just tell AskSafe what happened",
    iconName: "help",
  },
]

const situationPrompts: Record<Category, string> = {
  caller:
    "What did the caller say? For example, who did they claim to be and what did they ask you to do?",
  message:
    "What does the message say? You can type it out or describe it in your own words.",
  money: "What were you asked to pay, and how? Who is asking for it?",
  door: "Who is at the door, and what are they asking for?",
  online:
    "What did you see online? For example, a pop-up, an offer, or a website warning.",
  video:
    "What happened on the video call or chat? Who were they, and what did they ask you to do?",
  other:
    "Tell AskSafe what happened. You can start anywhere, even if you're not sure what kind of situation it is.",
}

const STANDARD_START_HELPER =
  "Choose any action that fits, then type or use voice to describe what happened. I will check it after you send details."

const NATURAL_LANGUAGE_START_HELPER =
  "Type or use voice in your own words. If you know what they want you to do, choose a chip below. If not, you can leave it as Not sure."

export function getCategoryOptionGroups(): {
  primary: CategoryOptionCopy
  standard: CategoryOptionCopy[]
} {
  return {
    primary: moneyOption,
    standard: standardOptions,
  }
}

export function getSituationPrompt(category: Category): string {
  return situationPrompts[category]
}

export function getSituationStartMessages(category: Category): string[] {
  return [
    getSituationPrompt(category),
    category === "other" ? NATURAL_LANGUAGE_START_HELPER : STANDARD_START_HELPER,
  ]
}
