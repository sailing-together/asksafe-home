"use client"

import { useRef, useState } from "react"
import { ShieldCheck, Banknote, Link2, KeyRound, IdCard, PhoneOutgoing, Download, MonitorSmartphone, CircleHelp, Mic, Send, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StepBack } from "@/components/category-step"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/lib/use-voice"
import { getGuidedClarificationInteraction } from "@/lib/guided-clarification-interaction"
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

type ChatMessage = {
  role: "assistant" | "user"
  text: string
}

function buildAssistantReply({
  category,
  nextDetails,
  requests,
  hasAskedClarification,
}: {
  category: Category
  nextDetails: string[]
  requests: RequestType[]
  hasAskedClarification: boolean
}) {
  return getGuidedClarificationInteraction({
    message: nextDetails.join("\n"),
    category,
    requests,
    hasAskedClarification,
  })
}

export function SituationInput({
  category,
  initialMessage = "",
  initialRequests = [],
  onSubmit,
  onBack,
  onHome,
}: {
  category: Category
  initialMessage?: string
  initialRequests?: RequestType[]
  onSubmit: (message: string, requests: RequestType[]) => void
  onBack: () => void
  onHome: () => void
}) {
  const [value, setValue] = useState(initialMessage)
  const [details, setDetails] = useState<string[]>([])
  const [hasAskedClarification, setHasAskedClarification] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      text: prompts[category],
    },
    {
      role: "assistant",
      text:
        "Choose any action that fits, then type or use voice to describe what happened. I will check it after you send details.",
    },
  ])
  const [requests, setRequests] = useState<RequestType[]>(initialRequests)
  const canSendDetails = value.trim().length >= 3
  const canAnalyze = details.length > 0
  const voice = useSpeechRecognition()
  const voiceBaseRef = useRef("")

  function handleVoice() {
    if (voice.listening) {
      voice.stop()
      return
    }
    voiceBaseRef.current = value.trim()
    voice.start((text) => {
      setValue([voiceBaseRef.current, text].filter(Boolean).join(" "))
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

  function handleSubmit() {
    const text = value.trim()
    if (!text) return

    const nextDetails = [...details, text]
    setDetails(nextDetails)
    setMessages((prev) => [...prev, { role: "user", text }])
    setValue("")

    const interaction = buildAssistantReply({
      category,
      nextDetails,
      requests,
      hasAskedClarification,
    })

    if (interaction.type === "clarification") {
      setHasAskedClarification(true)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `${interaction.question} ${interaction.helperText}`,
        },
      ])
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: interaction.text,
      },
    ])
  }

  function handleAnalyze() {
    if (!canAnalyze) return
    onSubmit(details.join("\n"), requests.length > 0 ? requests : ["unsure"])
  }

  const selectedRequestLabels = requestOptions
    .filter((option) => requests.includes(option.value))
    .map((option) => option.label)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSendDetails) handleSubmit()
      }}
      className="flex flex-col gap-5 pt-6 pb-16"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <StepBack onBack={onBack} step="Step 2 of 2" />
        </div>
        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-base font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          Home
        </button>
      </div>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-balance font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Tell me what happened
        </h1>
        <p className="text-lg text-muted-foreground">
          Use your own words. There&apos;s no rush, and nothing is shared.
        </p>
      </div>

      <section
        aria-label="AskSafe conversation"
        aria-live="polite"
        className="flex min-h-[26rem] flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
      >
        <div className="flex flex-1 flex-col gap-3">
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-3 text-lg leading-relaxed shadow-sm",
                message.role === "assistant"
                  ? "self-start border border-border bg-background text-foreground"
                  : "self-end bg-primary text-primary-foreground",
              )}
            >
              {message.text}
            </article>
          ))}

          {selectedRequestLabels.length > 0 && (
            <article className="max-w-[88%] self-end rounded-2xl bg-secondary px-4 py-3 text-base font-medium leading-relaxed text-primary">
              They want me to: {selectedRequestLabels.join(", ")}
            </article>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-base font-semibold text-foreground">
            What are they asking you to do?
          </p>
          <div className="mb-4 flex flex-wrap gap-2.5">
            {requestOptions.map((option) => {
              const selected = requests.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleRequest(option.value)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-secondary",
                  )}
                >
                  <option.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {option.label}
                </button>
              )}
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3">
            <Textarea
              id="situation"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Message AskSafe with what happened..."
              autoFocus
              className="min-h-28 resize-none border-0 bg-transparent p-2 text-lg leading-relaxed text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {voice.supported ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleVoice}
                  aria-pressed={voice.listening}
                  className={cn(
                    "h-auto justify-start rounded-xl px-4 py-3 text-base font-semibold sm:w-auto",
                    voice.listening
                      ? "bg-accent/10 text-accent-foreground"
                      : "text-primary hover:bg-secondary",
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
              ) : (
                <p className="text-base text-muted-foreground">
                  Voice input is not supported in this browser. You can still type.
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={!canSendDetails}
                className={cn(
                  "h-auto rounded-xl px-5 py-3 text-base font-semibold sm:shrink-0",
                  canSendDetails && "shadow-sm",
                )}
              >
                <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                Send details
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Button
        type="button"
        size="lg"
        disabled={!canAnalyze}
        onClick={handleAnalyze}
        className="h-auto rounded-2xl px-8 py-5 text-xl font-semibold shadow-sm"
      >
        <ShieldCheck className="mr-2 h-6 w-6" aria-hidden="true" />
        Show me the safer next step
      </Button>
    </form>
  )
}
