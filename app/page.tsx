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
import { analyze, type Category, type RequestType, type SafetyResult } from "@/lib/analyze"

type Step = "home" | "category" | "input" | "thinking" | "result"

export default function Page() {
  const [step, setStep] = useState<Step>("home")
  const [category, setCategory] = useState<Category>("other")
  const [result, setResult] = useState<SafetyResult | null>(null)
  const [support, setSupport] = useState<SupportSetup | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [prefill, setPrefill] = useState<PracticeScenario | null>(null)

  function signOut() {
    setSignedIn(false)
    setSupport(null)
    setSupportOpen(false)
  }

  function reset() {
    setResult(null)
    setPrefill(null)
    setStep("home")
  }

  function tryExample(scenario: PracticeScenario) {
    setPrefill(scenario)
    setCategory(scenario.category)
    setStep("input")
  }

  function runAnalysis(message: string, requests: RequestType[]) {
    setStep("thinking")
    // Brief, deliberate pause so the result doesn't feel rushed.
    window.setTimeout(() => {
      setResult(analyze(message, category, requests))
      setStep("result")
    }, 1600)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        signedIn={signedIn}
        firstName={support?.yourName?.split(" ")[0] ?? ""}
        onOpenSupport={() => setSupportOpen(true)}
      />
      <main className="mx-auto w-full max-w-3xl px-5">
        {step === "home" && (
          <HomeScreen
            onStart={() => setStep("category")}
            onOpenSupport={() => setSupportOpen(true)}
            onTryExample={tryExample}
          />
        )}

        {step === "category" && (
          <CategoryStep
            onBack={reset}
            onSelect={(c) => {
              setPrefill(null)
              setCategory(c)
              setStep("input")
            }}
          />
        )}

        {step === "input" && (
          <SituationInput
            key={prefill ? prefill.message : "blank"}
            category={category}
            initialMessage={prefill?.message ?? ""}
            initialRequests={prefill?.requests ?? []}
            onBack={() => setStep("category")}
            onSubmit={runAnalysis}
          />
        )}

        {step === "thinking" && <ThinkingScreen />}

        {step === "result" && result && (
          <ResultCard
            result={result}
            support={support}
            onOpenSupport={() => setSupportOpen(true)}
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
        onSignIn={() => setSignedIn(true)}
        onSignOut={signOut}
        onCreate={setSupport}
      />
    </div>
  )
}
