import Image from "next/image"
import { Heart, Ear, ListChecks, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export function HomeScreen({
  onStart,
  onOpenSupport,
}: {
  onStart: () => void
  onOpenSupport: () => void
}) {
  return (
    <div className="flex flex-col gap-12 pb-16">
      <section className="flex flex-col items-center gap-6 pt-6 text-center sm:pt-10">
        <div className="mx-auto w-full max-w-[160px] overflow-hidden rounded-3xl border border-border bg-secondary/40 shadow-sm sm:max-w-xs">
          <Image
            src="/hero-illustration.png"
            alt="An older adult sitting comfortably at home, calmly checking their phone with a protective shield nearby"
            width={1024}
            height={1024}
            priority
            className="h-auto w-full"
          />
        </div>
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
          Private by design. You choose what to share.
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

      <TrustedSupport onOpenSupport={onOpenSupport} />

      {/* Compact reassurance strip */}
      <section
        aria-label="Quick help"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-base leading-relaxed text-muted-foreground">
          In immediate danger or want to report a scam? Help is always here.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="tel:000"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-base font-semibold text-foreground hover:bg-accent/20"
          >
            <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
            Emergency 000
          </a>
          <a
            href="https://www.scamwatch.gov.au"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary/70"
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
            Scamwatch
          </a>
        </div>
      </section>
    </div>
  )
}
