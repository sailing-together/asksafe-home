import { Mail, HandCoins, Headset } from "lucide-react"
import type { Category, RequestType } from "@/lib/analyze"

export interface PracticeScenario {
  category: Category
  message: string
  requests: RequestType[]
}

const examples: {
  title: string
  body: string
  icon: typeof Mail
  scenario: PracticeScenario
}[] = [
  {
    title: "Bank message with a link",
    body: "A message says your account will close unless you tap a link.",
    icon: Mail,
    scenario: {
      category: "message",
      message:
        "I received a text saying my bank account will be closed unless I tap a link to confirm my details right now.",
      requests: ["link"],
    },
  },
  {
    title: "Urgent money request",
    body: "Someone says a family member needs money right now.",
    icon: HandCoins,
    scenario: {
      category: "money",
      message:
        "Someone messaged saying a family member is stranded and needs me to send money urgently right now.",
      requests: ["pay"],
    },
  },
  {
    title: "Tech support call",
    body: "A caller asks you to install an app or share your screen.",
    icon: Headset,
    scenario: {
      category: "caller",
      message:
        "A caller said he is from tech support and needs me to install an app and share my screen to fix my computer.",
      requests: ["install", "screen"],
    },
  },
]

export function PracticeSection({
  onTryExample,
}: {
  onTryExample: (scenario: PracticeScenario) => void
}) {
  return (
    <section
      aria-labelledby="practice"
      className="rounded-2xl border border-border bg-card px-5 py-5 sm:px-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="practice"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Try a safe practice example
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Practise with a common situation before it happens.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:justify-end">
          {examples.map((example) => (
            <button
              key={example.title}
              type="button"
              onClick={() => onTryExample(example.scenario)}
              aria-label={`Try example: ${example.title}. ${example.body}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/25 bg-background px-4 py-2.5 text-base font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <example.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {example.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
