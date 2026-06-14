import { Heart, Ear, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OfficialHelp } from "@/components/official-help"
import { TrustedSupport } from "@/components/trusted-support"

const points = [
  {
    icon: Ear,
    title: "Tell it what happened",
    body: "Describe the call, message, or situation in your own words. No special terms needed.",
  },
  {
    icon: ListChecks,
    title: "Get one clear answer",
    body: "A simple read on how risky it looks, and the single safest thing to do next.",
  },
  {
    icon: Heart,
    title: "Never feel rushed",
    body: "One gentle step at a time, with people you trust only a tap away.",
  },
]

export function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-12 pb-16">
      <section className="flex flex-col items-center gap-6 pt-10 text-center">
        <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          A safe place to pause and think
        </span>
        <h1 className="text-balance font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Not sure if something is safe? Let&apos;s look at it together.
        </h1>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          AskSafe Home helps you make calm, confident decisions when a call,
          message, or knock at the door leaves you feeling unsure.
        </p>
        <Button
          size="lg"
          onClick={onStart}
          className="mt-2 h-auto rounded-2xl px-10 py-6 text-xl font-semibold shadow-sm"
        >
          I feel unsure about something
        </Button>
        <p className="text-base text-muted-foreground">
          Free, private, and made to be easy on the eyes.
        </p>
      </section>

      <section aria-labelledby="how-it-works" className="flex flex-col gap-5">
        <h2
          id="how-it-works"
          className="text-center font-heading text-2xl font-semibold text-foreground"
        >
          How AskSafe helps
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <point.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {point.title}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <TrustedSupport />
      <OfficialHelp />
    </div>
  )
}
