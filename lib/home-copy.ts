import { Ear, Heart, ListChecks } from "lucide-react"

export const HOME_SCREEN_COPY = {
  badge: "A safe place to pause and think",
  headline: "Not sure if something is safe? Let's look at it together.",
  heroBody:
    "AskSafe Home helps you make calm, confident decisions when a message, call, video chat, or payment request leaves you feeling unsure.",
  startButton: "I feel unsure about something",
  privacyNote: "Private by design. You choose what to share.",
  howTitle: "How AskSafe helps",
  points: [
    {
      icon: Ear,
      title: "Tell AskSafe what happened",
      body: "Describe the call, message, or situation in your own words. No special terms needed.",
    },
    {
      icon: ListChecks,
      title: "Get one safer next step",
      body: "A simple read on how risky it looks, and the single safer thing to do next.",
    },
    {
      icon: Heart,
      title: "Never feel rushed",
      body: "One gentle step at a time, with people you trust only a tap away.",
    },
  ],
} as const