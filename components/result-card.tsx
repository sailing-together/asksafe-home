import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CircleCheck,
  Ban,
  Info,
  ListChecks,
  RotateCcw,
  Phone,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OfficialHelp } from "@/components/official-help"
import type { SafetyResult } from "@/lib/analyze"

const helpByRisk: Record<SafetyResult["risk"], string[]> = {
  high: ["emergency", "idcare", "scamwatch", "acsc"],
  caution: ["scamwatch", "idcare"],
  low: ["scamwatch"],
}

const riskStyles = {
  high: {
    label: "High risk",
    icon: ShieldAlert,
    band: "bg-destructive/10 border-destructive/30",
    chip: "bg-destructive text-primary-foreground",
    iconColor: "text-destructive",
  },
  caution: {
    label: "Be careful",
    icon: ShieldQuestion,
    band: "bg-accent/10 border-accent/40",
    chip: "bg-accent text-accent-foreground",
    iconColor: "text-accent",
  },
  low: {
    label: "Looks okay",
    icon: ShieldCheck,
    band: "bg-primary/8 border-primary/25",
    chip: "bg-primary text-primary-foreground",
    iconColor: "text-primary",
  },
} as const

export function ResultCard({
  result,
  onCheckAnother,
}: {
  result: SafetyResult
  onCheckAnother: () => void
}) {
  const style = riskStyles[result.risk]
  const RiskIcon = style.icon

  return (
    <div className="flex flex-col gap-6 pt-6 pb-16">
      {/* Risk banner */}
      <div className={`flex flex-col gap-4 rounded-3xl border p-6 sm:p-7 ${style.band}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card">
            <RiskIcon className={`h-7 w-7 ${style.iconColor}`} aria-hidden="true" />
          </span>
          <span className={`rounded-full px-4 py-1.5 text-base font-semibold ${style.chip}`}>
            {style.label}
          </span>
        </div>
        <h1 className="text-balance font-heading text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
          {result.headline}
        </h1>
      </div>

      {/* Safer next step */}
      <Section
        icon={CircleCheck}
        iconClass="text-primary"
        title="Your safer next step"
      >
        <p className="text-lg leading-relaxed text-foreground">
          {result.saferStep}
        </p>
      </Section>

      {/* What not to do yet */}
      <Section icon={Ban} iconClass="text-destructive" title="What not to do yet">
        <ul className="flex flex-col gap-2.5">
          {result.doNotYet.map((item) => (
            <li key={item} className="flex items-start gap-3 text-lg leading-relaxed text-foreground">
              <Ban className="mt-1 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Why */}
      <Section icon={Info} iconClass="text-accent" title="Why I'm saying this">
        <p className="text-lg leading-relaxed text-foreground">{result.why}</p>
      </Section>

      {/* Verify */}
      <Section icon={ListChecks} iconClass="text-primary" title="How to check it's real">
        <ol className="flex flex-col gap-3">
          {result.verify.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-lg leading-relaxed text-foreground">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-semibold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Official help in Australia */}
      <OfficialHelp
        ids={helpByRisk[result.risk]}
        showReminder={result.risk !== "low"}
      />

      {/* Support actions */}
      <div className="flex flex-col gap-3 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-medium leading-relaxed text-foreground">
          It&apos;s your choice — if you&apos;d like a second opinion, talk it
          over with someone you trust.
        </p>
        <a
          href="tel:"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-auto shrink-0 rounded-2xl px-6 py-5 text-lg font-semibold",
          )}
        >
          <Phone className="mr-2 h-5 w-5" aria-hidden="true" />
          Talk to someone I trust
        </a>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onCheckAnother}
        className="h-auto rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary"
      >
        <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" />
        Check something else
      </Button>
    </div>
  )
}

function Section({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: typeof Info
  iconClass: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2.5 font-heading text-xl font-semibold text-foreground">
        <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}
