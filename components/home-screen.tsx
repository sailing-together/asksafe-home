import Image from "next/image"
import { Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrustedSupport } from "@/components/trusted-support"
import { PracticeSection, type PracticeScenario } from "@/components/practice-section"
import { HOME_SCREEN_COPY } from "@/lib/home-copy"


export function HomeScreen({
  onStart,
  onOpenSupport,
  onTryExample,
}: {
  onStart: () => void
  onOpenSupport: () => void
  onTryExample: (scenario: PracticeScenario) => void
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
          {HOME_SCREEN_COPY.badge}
        </span>
        <h1 className="text-balance font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          {HOME_SCREEN_COPY.headline}
        </h1>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {HOME_SCREEN_COPY.heroBody}
        </p>
        <Button
          size="lg"
          onClick={onStart}
          className="mt-2 h-auto rounded-2xl px-10 py-6 text-xl font-semibold shadow-sm"
        >
          {HOME_SCREEN_COPY.startButton}
        </Button>
        <p className="text-base text-muted-foreground">
          {HOME_SCREEN_COPY.privacyNote}
        </p>
      </section>

      <section aria-labelledby="how-it-works" className="flex flex-col gap-5">
        <h2
          id="how-it-works"
          className="text-center font-heading text-2xl font-semibold text-foreground"
        >
          {HOME_SCREEN_COPY.howTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOME_SCREEN_COPY.points.map((point) => (
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

      <PracticeSection onTryExample={onTryExample} />

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
