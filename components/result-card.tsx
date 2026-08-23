"use client"

import { useState } from "react"
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CircleCheck,
  Ban,
  Info,
  ListChecks,
  SearchCheck,
  RotateCcw,
  UserRound,
  Share2,
  Check,
  Volume2,
  Square,
  CircleHelp,
  Phone,
  Mail,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OfficialHelp } from "@/components/official-help"
import { useSpeechSynthesis } from "@/lib/use-voice"
import { buildSafetyShareSummary } from "@/lib/share-summary"
import { getTrustedSupportActions } from "@/lib/trusted-support-actions"
import type { SafetyResult } from "@/lib/analyze"
import type { SupportSetup } from "@/components/trusted-support-dialog"

const helpByRisk: Record<SafetyResult["risk"], string[]> = {
  high: ["emergency", "idcare", "scamwatch", "acsc"],
  caution: ["scamwatch", "idcare"],
  low: ["scamwatch"],
}

const riskStyles = {
  high: {
    label: "Pause first",
    icon: ShieldAlert,
    band: "bg-destructive/10 border-destructive/30",
    chip: "bg-destructive text-primary-foreground",
    iconColor: "text-destructive",
  },
  caution: {
    label: "Take a closer look",
    icon: ShieldQuestion,
    band: "bg-accent/10 border-accent/40",
    chip: "bg-accent text-accent-foreground",
    iconColor: "text-accent",
  },
  low: {
    label: "Looks okay so far",
    icon: ShieldCheck,
    band: "bg-primary/8 border-primary/25",
    chip: "bg-primary text-primary-foreground",
    iconColor: "text-primary",
  },
} as const

export function ResultCard({
  result,
  support,
  onOpenSupport,
  onSupportAction,
  onFeedback,
  onAddMoreDetails,
  onCheckAnother,
}: {
  result: SafetyResult
  support: SupportSetup | null
  onOpenSupport: () => void
  onSupportAction?: (action: "summary-shared") => void
  onFeedback?: (helpful: boolean, reason: string) => void
  onAddMoreDetails: () => void
  onCheckAnother: () => void
}) {
  const style = riskStyles[result.risk]
  const RiskIcon = style.icon
  // For a family or trusted-person money request, lead with a calm,
  // verify-first instruction rather than anything that sounds like a verdict.
  const isFamilyMoneyRequest = result.riskSignals.some(
    (signal) => signal.id === "family-money-request",
  )
  const saferStepText = isFamilyMoneyRequest
    ? "Do not send money yet. Call the family member using a number you already trust. If you cannot reach them, ask another trusted person to help you check."
    : result.saferStep
  const [shared, setShared] = useState(false)
  const [feedbackChoice, setFeedbackChoice] = useState<"yes" | "no" | null>(null)
  const speech = useSpeechSynthesis()
  const trustedSupportActions = getTrustedSupportActions(support)

  function readAloud() {
    if (speech.speaking) {
      speech.stop()
      return
    }
    const script = [
      `${style.label}. ${result.headline}`,
      `Your safer next step. ${saferStepText}`,
      `What to hold off on for now. ${result.doNotYet.join(". ")}`,
      `How to check before you act. ${result.verify.join(". ")}`,
    ].join(". ")
    speech.speak(script)
  }

  async function shareSummary() {
    if (!support) return
    const summary = buildSafetyShareSummary(result)
    try {
      await navigator.clipboard.writeText(summary)
      onSupportAction?.("summary-shared")
      setShared(true)
      window.setTimeout(() => setShared(false), 2500)
    } catch {
      setShared(false)
    }
  }

  function chooseFeedback(choice: "yes" | "no") {
    setFeedbackChoice(choice)
    onFeedback?.(
      choice === "yes",
      choice === "yes" ? "clear-next-step" : "needs-more-clarity",
    )
  }

  return (
    <div className="flex flex-col gap-5 pt-6 pb-16 sm:gap-6">
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

      {/* Read aloud */}
      {speech.supported ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={readAloud}
          aria-pressed={speech.speaking}
          className={cn(
            "h-auto w-full rounded-2xl px-6 py-5 text-lg font-semibold sm:w-auto sm:self-start",
            speech.speaking
              ? "border-accent bg-accent/10 text-accent-foreground"
              : "border-primary/30 bg-card text-primary hover:bg-secondary",
          )}
        >
          {speech.speaking ? (
            <>
              <Square className="mr-2 h-5 w-5" aria-hidden="true" />
              Stop reading
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-5 w-5" aria-hidden="true" />
              Read this aloud
            </>
          )}
        </Button>
      ) : (
        <p className="text-base text-muted-foreground">
          Read aloud is not supported in this browser.
        </p>
      )}

      {result.clarification?.needed && (
        <section className="rounded-2xl border border-primary/20 bg-secondary/60 p-6">
          <div className="flex items-start gap-3">
            <CircleHelp className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Before you decide
              </h2>
              <p className="text-lg leading-relaxed text-foreground">
                {result.clarification.question}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {result.clarification.reason}
              </p>
              {result.clarification.checks.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {result.clarification.checks.slice(0, 3).map((check) => (
                    <li
                      key={check}
                      className="flex items-start gap-2 text-base leading-relaxed text-foreground"
                    >
                      <CircleCheck
                        className="mt-1 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onAddMoreDetails}
                className="mt-4 h-auto rounded-2xl border-primary/30 bg-card px-5 py-4 text-base font-semibold text-primary hover:bg-background"
              >
                <CircleHelp className="mr-2 h-5 w-5" aria-hidden="true" />
                Add more details
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Safer next step */}
      <Section
        icon={CircleCheck}
        iconClass="text-primary"
        title="Your safer next step"
      >
        <p className="text-lg leading-relaxed text-foreground">
          {saferStepText}
        </p>
      </Section>

      {result.riskSignals.length > 0 && (
        <Section
          icon={SearchCheck}
          iconClass="text-primary"
          title="What stood out"
        >
          <ul className="flex flex-wrap gap-2.5">
            {result.riskSignals.slice(0, 4).map((signal) => (
              <li
                key={signal.id}
                className="rounded-full bg-secondary px-3 py-2 text-base font-medium text-primary"
              >
                {signal.label}
              </li>
            ))}
          </ul>
          {result.sourceIds.length > 0 && (
            <p className="text-base leading-relaxed text-muted-foreground">
              These are general safety patterns worth knowing about — not proof
              that anything is wrong.
            </p>
          )}
        </Section>
      )}

      {/* What not to do yet */}
      <Section icon={Ban} iconClass="text-destructive" title="What to hold off on for now">
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
      <Section icon={Info} iconClass="text-accent" title="Why this is worth a pause">
        <p className="text-lg leading-relaxed text-foreground">{result.why}</p>
      </Section>

      {/* Verify */}
      <Section icon={ListChecks} iconClass="text-primary" title="How to check before you act">
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
      <div className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
        <div className="flex flex-col gap-3">
          <p className="text-lg font-medium leading-relaxed text-foreground">
            You don&apos;t have to decide alone. You can choose whether to
            contact someone you trust or copy a short summary.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {trustedSupportActions.map((action) => {
              if (action.kind === "call") {
                return (
                  <a
                    key={action.kind}
                    href={action.href}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-auto w-full rounded-2xl px-6 py-5 text-lg font-semibold sm:w-auto",
                    )}
                  >
                    <Phone className="mr-2 h-5 w-5" aria-hidden="true" />
                    {action.label}
                  </a>
                )
              }

              if (action.kind === "email") {
                return (
                  <a
                    key={action.kind}
                    href={action.href}
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "h-auto w-full rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary sm:w-auto",
                    )}
                  >
                    <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                    {action.label}
                  </a>
                )
              }

              return (
                <Button
                  key={action.kind}
                  type="button"
                  size="lg"
                  onClick={onOpenSupport}
                  className="h-auto w-full rounded-2xl px-6 py-5 text-lg font-semibold sm:w-auto"
                >
                  <UserRound className="mr-2 h-5 w-5" aria-hidden="true" />
                  {action.label}
                </Button>
              )
            })}
            {support?.trustedName && (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={shareSummary}
                className="h-auto w-full rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary sm:w-auto"
              >
                {shared ? (
                  <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                ) : (
                  <Share2 className="mr-2 h-5 w-5" aria-hidden="true" />
                )}
                {shared ? "Copied, now paste it" : `Copy summary for ${support.trustedName}`}
              </Button>
            )}
          </div>
        </div>
        <p className="text-base leading-relaxed text-muted-foreground">
          You stay in control. AskSafe does not call, email, notify, or share
          anything automatically.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-foreground">
          Was this helpful?
        </p>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Button
            type="button"
            variant={feedbackChoice === "yes" ? "default" : "outline"}
            onClick={() => chooseFeedback("yes")}
            className="h-auto rounded-xl px-5 py-3 text-base font-semibold"
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={feedbackChoice === "no" ? "default" : "outline"}
            onClick={() => chooseFeedback("no")}
            className="h-auto rounded-xl px-5 py-3 text-base font-semibold"
          >
            Not yet
          </Button>
        </div>
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
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2.5 font-heading text-xl font-semibold text-foreground">
        <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}
