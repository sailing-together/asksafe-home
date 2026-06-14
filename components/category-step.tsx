import { Phone, MessageSquare, Banknote, DoorOpen, Globe, Video, HelpCircle, ArrowLeft } from "lucide-react"
import type { Category } from "@/lib/analyze"

const moneyOption: { value: Category; label: string; hint: string; icon: typeof Phone } = {
  value: "money",
  label: "Money or payments",
  hint: "Asked to pay, transfer, or send money",
  icon: Banknote,
}

const options: { value: Category; label: string; hint: string; icon: typeof Phone }[] = [
  { value: "caller", label: "A phone call", hint: "Someone rang me", icon: Phone },
  { value: "message", label: "A text or email", hint: "A message I received", icon: MessageSquare },
  { value: "door", label: "Someone at the door", hint: "A visitor or knock", icon: DoorOpen },
  { value: "online", label: "Something online", hint: "A website or pop-up", icon: Globe },
  { value: "video", label: "Video call or online chat", hint: "A video call, chat app, or social message", icon: Video },
  { value: "other", label: "Something else", hint: "Not sure / other", icon: HelpCircle },
]

export function CategoryStep({
  onSelect,
  onBack,
}: {
  onSelect: (category: Category) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6 pt-6 pb-16">
      <StepBack onBack={onBack} step="Step 1 of 2" />
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-balance font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          What feels unsure right now?
        </h1>
        <p className="text-lg text-muted-foreground">
          Pick the one that fits best. There&apos;s no wrong choice.
        </p>
      </div>
      <button
        type="button"
        onClick={() => onSelect(moneyOption.value)}
        className="flex items-center gap-4 rounded-2xl border-2 border-accent/50 bg-accent/10 p-6 text-left transition-colors hover:border-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <moneyOption.icon className="h-8 w-8" aria-hidden="true" />
        </span>
        <span>
          <span className="block font-heading text-2xl font-semibold text-foreground">
            {moneyOption.label}
          </span>
          <span className="block text-base text-muted-foreground">
            {moneyOption.hint}
          </span>
        </span>
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <option.icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-heading text-xl font-semibold text-foreground">
                {option.label}
              </span>
              <span className="block text-base text-muted-foreground">
                {option.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function StepBack({ onBack, step }: { onBack: () => void; step: string }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-base font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Back
      </button>
      <span className="text-sm font-medium text-muted-foreground">{step}</span>
    </div>
  )
}
