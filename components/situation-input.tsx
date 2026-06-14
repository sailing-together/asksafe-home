"use client"

import { useRef, useState } from "react"
import { ShieldCheck, Banknote, Link2, KeyRound, IdCard, PhoneOutgoing, Download, MonitorSmartphone, CircleHelp, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StepBack } from "@/components/category-step"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/lib/use-voice"
import type { Category, RequestType } from "@/lib/analyze"

const prompts: Record<Category, string> = {
  caller: "What did the caller say? For example, who did they claim to be and what did they ask you to do?",
  message: "What does the message say? You can type it out or describe it in your own words.",
  money: "What were you asked to pay, and how? Who is asking for it?",
  door: "Who is at the door, and what are they asking for?",
  online: "What did you see online? For example, a pop-up, an offer, or a website warning.",
  video: "What happened on the video call or chat? Who were they, and what did they ask you to do?",
  other: "Tell me what happened and what feels unsure to you.",
}

const requestOptions: { value: RequestType; label: string; icon: typeof Banknote }[] = [
  { value: "pay", label: "Pay money", icon: Banknote },
  { value: "link", label: "Click a link", icon: Link2 },
  { value: "code", label: "Share a code", icon: KeyRound },
  { value: "details", label: "Give personal details", icon: IdCard },
  { value: "callback", label: "Call back", icon: PhoneOutgoing },
  { value: "install", label: "Install an app", icon: Download },
  { value: "screen", label: "Share my screen", icon: MonitorSmartphone },
  { value: "unsure", label: "Not sure", icon: CircleHelp },
]

export function SituationInput({
  category,
  initialMessage = "",
  initialRequests = [],
  onSubmit,
  onBack,
}: {
  category: Category
  initialMessage?: string
  initialRequests?: RequestType[]
  onSubmit: (message: string, requests: RequestType[]) => void
  onBack: () => void
}) {
  const [value, setValue] = useState(initialMessage)
  const [requests, setRequests] = useState<RequestType[]>(initialRequests)
  const canSubmit = value.trim().length >= 3 || requests.some((r) => r !== "unsure")
  const voice = useSpeechRecognition()
  const voiceTextRef = useRef("")

  function handleVoice() {
    if (voice.listening) {
      voice.stop()
      return
    }
    voiceTextRef.current = value.trim()
    voice.start((text) => {
      voiceTextRef.current = [voiceTextRef.current, text].filter(Boolean).join(" ")
      setValue(voiceTextRef.current)
    })
  }

  function toggleRequest(value: RequestType) {
    setRequests((prev) => {
      if (value === "unsure") {
        return prev.includes("unsure") ? [] : ["unsure"]
      }
      const withoutUnsure = prev.filter((r) => r !== "unsure")
      return withoutUnsure.includes(value)
        ? withoutUnsure.filter((r) => r !== value)
        : [...withoutUnsure, value]
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onSubmit(value, requests)
      }}
      className="flex flex-col gap-6 pt-6 pb-16"
    >
      <StepBack onBack={onBack} step="Step 2 of 2" />
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-balance font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Tell me what happened
        </h1>
        <p className="text-lg text-muted-foreground">
          Use your own words. There&apos;s no rush, and nothing is shared.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <Label
          htmlFor="situation"
          className="text-lg font-semibold text-foreground"
        >
          {prompts[category]}
        </Label>
        <Textarea
          id="situation"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Start typing here..."
          autoFocus
          className="min-h-44 resize-none rounded-xl border-border bg-background p-4 text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2"
        />

        {voice.supported ? (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleVoice}
              aria-pressed={voice.listening}
              className={cn(
                "h-auto w-full rounded-xl px-6 py-4 text-lg font-semibold sm:w-auto",
                voice.listening
                  ? "border-accent bg-accent/10 text-accent-foreground"
                  : "border-primary/30 bg-card text-primary hover:bg-secondary",
              )}
            >
              {voice.listening ? (
                <>
                  <span
                    className="mr-2 inline-block h-3 w-3 animate-pulse rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  Listening... Tap again to stop
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" aria-hidden="true" />
                  Use voice
                </>
              )}
            </Button>
          </div>
        ) : (
          <p className="text-base text-muted-foreground">
            Voice input is not supported in this browser. You can still type.
          </p>
        )}
      </div>

      <fieldset className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:mt-1 sm:p-6">
        <legend className="text-lg font-semibold text-foreground">
          What are they asking you to do?
        </legend>
        <p className="text-base text-muted-foreground">
          Pick any that apply. You can skip this if you&apos;re not sure.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {requestOptions.map((option) => {
            const selected = requests.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleRequest(option.value)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-secondary",
                )}
              >
                <option.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {option.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <Button
        type="submit"
        size="lg"
        disabled={!canSubmit}
        className="h-auto rounded-2xl px-8 py-6 text-xl font-semibold shadow-sm"
      >
        <ShieldCheck className="mr-2 h-6 w-6" aria-hidden="true" />
        Show me the safer next step
      </Button>
    </form>
  )
}
