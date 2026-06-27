"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { HomeScreen } from "@/components/home-screen"
import { CategoryStep } from "@/components/category-step"
import { SituationInput } from "@/components/situation-input"
import { ThinkingScreen } from "@/components/thinking-screen"
import { ResultCard } from "@/components/result-card"
import { TrustedSupportDialog, type SupportSetup } from "@/components/trusted-support-dialog"
import { SiteFooter } from "@/components/site-footer"
import type { PracticeScenario } from "@/components/practice-section"
import { type Category, type RequestType, type SafetyResult } from "@/lib/analyze"
import { splitDraftMessageIntoDetails } from "@/lib/situation-input-state"
import { analyzeSafetyWithFallback } from "@/lib/analyze-client"
import { recordSafetyEvent } from "@/lib/safety-event-client"
import {
  recordFeedbackEvent,
  recordSupportEvent,
  type SupportEventAction,
} from "@/lib/outcome-event-client"

type Step = "home" | "category" | "input" | "thinking" | "result"

type InputDraft = {
  message: string
  requests: RequestType[]
}

export default function Page() {
  const [step, setStep] = useState<Step>("home")
  const [category, setCategory] = useState<Category>("other")
  const [result, setResult] = useState<SafetyResult | null>(null)
  const [support, setSupport] = useState<SupportSetup | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [prefill, setPrefill] = useState<PracticeScenario | null>(null)
  const [safetyEventId, setSafetyEventId] = useState<string | undefined>()
  const [inputDraft, setInputDraft] = useState<InputDraft | null>(null)
  const [quotaSubjectId] = useState(getOrCreateQuotaSubjectId)

  function signOut() {
    setSignedIn(false)
    setSupport(null)
    setSupportOpen(false)
  }

  function reset() {
    setResult(null)
    setPrefill(null)
    setSafetyEventId(undefined)
    setInputDraft(null)
    setStep("home")
  }

  function tryExample(scenario: PracticeScenario) {
    setPrefill(scenario)
    setSafetyEventId(undefined)
    setInputDraft(null)
    setCategory(scenario.category)
    setStep("input")
  }

  function runAnalysis(message: string, requests: RequestType[]) {
    setStep("thinking")
    const selectedRequests: RequestType[] = requests.length > 0 ? requests : ["unsure"]
    setInputDraft({ message, requests: selectedRequests })

    // Brief, deliberate pause so the result doesn't feel rushed.
    window.setTimeout(() => {
      void analyzeSafetyWithFallback({
        message,
        category,
        requests: selectedRequests,
        userTier: signedIn ? "registered" : "anonymous",
        quotaSubjectId,
      }).then((safetyResult) => {
        setResult(safetyResult)
        void recordSafetyEvent({ category, requests: selectedRequests, result: safetyResult }).then((event) => {
          if (event.id) setSafetyEventId(event.id)
        })
        setStep("result")
      })
    }, 1600)
  }

  function recordSupportAction(action: SupportEventAction) {
    void recordSupportEvent({ action, safetyEventId })
  }

  function addMoreDetails() {
    if (!result?.clarification?.needed) return
    setSafetyEventId(undefined)
    setStep("input")
  }

  function openSupport() {
    recordSupportAction("setup-opened")
    setSupportOpen(true)
  }

  function recordFeedback(helpful: boolean, reason: string) {
    void recordFeedbackEvent({
      safetyEventId,
      helpful,
      reason,
      risk: result?.risk,
      riskSignalIds: result?.riskSignals.map((signal) => signal.id),
      clarificationNeeded: result?.clarification?.needed ?? false,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        signedIn={signedIn}
        firstName={support?.yourName?.split(" ")[0] ?? ""}
        onHome={reset}
        onOpenSupport={openSupport}
      />
      <main className="mx-auto w-full max-w-3xl px-5">
        {step === "home" && (
          <HomeScreen
            onStart={() => setStep("category")}
            onOpenSupport={openSupport}
            onTryExample={tryExample}
          />
        )}

        {step === "category" && (
          <CategoryStep
            onBack={reset}
            onSelect={(c) => {
              setPrefill(null)
              setSafetyEventId(undefined)
              setInputDraft(null)
              setCategory(c)
              setStep("input")
            }}
          />
        )}

        {step === "input" && (
          <SituationInput
            key={inputDraft ? `draft-${inputDraft.message}` : prefill ? prefill.message : "blank"}
            category={category}
            initialMessage={inputDraft ? "" : prefill?.message ?? ""}
            initialDetails={inputDraft ? splitDraftMessageIntoDetails(inputDraft.message) : undefined}
            initialRequests={inputDraft?.requests ?? prefill?.requests ?? []}
            onBack={() => setStep("category")}
            onHome={reset}
            onSubmit={runAnalysis}
          />
        )}

        {step === "thinking" && <ThinkingScreen />}

        {step === "result" && result && (
          <ResultCard
            result={result}
            support={support}
            onOpenSupport={openSupport}
            onSupportAction={recordSupportAction}
            onFeedback={recordFeedback}
            onAddMoreDetails={addMoreDetails}
            onCheckAnother={reset}
          />
        )}
      </main>

      <SiteFooter />

      <TrustedSupportDialog
        open={supportOpen}
        existing={support}
        signedIn={signedIn}
        onClose={() => setSupportOpen(false)}
        onSupportAction={recordSupportAction}
        onSignIn={() => setSignedIn(true)}
        onSignOut={signOut}
        onCreate={setSupport}
      />
    </div>
  )
}
function getOrCreateQuotaSubjectId(): string {
  if (typeof window === "undefined") return "server-render"

  const storageKey = "asksafe-quota-subject-id"
  const existing = window.localStorage.getItem(storageKey)
  if (existing) return existing

  const generated = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  window.localStorage.setItem(storageKey, generated)
  return generated
}