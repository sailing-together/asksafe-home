"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { HomeScreen } from "@/components/home-screen"
import { CategoryStep } from "@/components/category-step"
import { SituationInput } from "@/components/situation-input"
import { ResultCard } from "@/components/result-card"
import { analyze, type Category, type SafetyResult } from "@/lib/analyze"

type Step = "home" | "category" | "input" | "result"

export default function Page() {
  const [step, setStep] = useState<Step>("home")
  const [category, setCategory] = useState<Category>("other")
  const [result, setResult] = useState<SafetyResult | null>(null)

  function reset() {
    setResult(null)
    setStep("home")
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-5">
        {step === "home" && <HomeScreen onStart={() => setStep("category")} />}

        {step === "category" && (
          <CategoryStep
            onBack={reset}
            onSelect={(c) => {
              setCategory(c)
              setStep("input")
            }}
          />
        )}

        {step === "input" && (
          <SituationInput
            category={category}
            onBack={() => setStep("category")}
            onSubmit={(message) => {
              setResult(analyze(message, category))
              setStep("result")
            }}
          />
        )}

        {step === "result" && result && (
          <ResultCard result={result} onCheckAnother={reset} />
        )}
      </main>
    </div>
  )
}
