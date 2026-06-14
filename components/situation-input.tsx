"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StepBack } from "@/components/category-step"
import type { Category } from "@/lib/analyze"

const prompts: Record<Category, string> = {
  caller: "What did the caller say? For example, who did they claim to be and what did they ask you to do?",
  message: "What does the message say? You can type it out or describe it in your own words.",
  money: "What were you asked to pay, and how? Who is asking for it?",
  door: "Who is at the door, and what are they asking for?",
  online: "What did you see online? For example, a pop-up, an offer, or a website warning.",
  other: "Tell me what happened and what feels unsure to you.",
}

export function SituationInput({
  category,
  onSubmit,
  onBack,
}: {
  category: Category
  onSubmit: (message: string) => void
  onBack: () => void
}) {
  const [value, setValue] = useState("")
  const canSubmit = value.trim().length >= 3

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onSubmit(value)
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
      </div>

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
