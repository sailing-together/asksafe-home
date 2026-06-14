import { Mail, HandCoins, Headset, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <section aria-labelledby="practice" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 text-center">
        <h2
          id="practice"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          Practice with common situations
        </h2>
        <p className="text-lg text-muted-foreground">
          Try a safe example before it happens.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {examples.map((example) => (
          <div
            key={example.title}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <example.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {example.title}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {example.body}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onTryExample(example.scenario)}
              className="h-auto justify-center rounded-xl border-primary/30 bg-background px-4 py-3 text-base font-semibold text-primary hover:bg-secondary"
            >
              Try this example
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
