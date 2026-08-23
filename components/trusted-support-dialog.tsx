"use client"

import { useEffect, useState } from "react"
import { UserRound, X, ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export type SupportSetup = {
  yourName: string
  email: string
  phone: string
  usingFor: "self" | "other"
  trustedName: string
  relationship: string
  trustedEmail: string
  trustedPhone: string
  trustedContactNeedsUpdate: boolean
}

type Phase = "signin" | "code" | "form" | "summary"
type AsyncResult =
  | { ok: true }
  | {
      ok: false
      reason: string
    }
type VerifyResult =
  | { ok: true; setup: SupportSetup | null; signedIn: boolean; signedInEmail: string }
  | { ok: false; reason: string }
type SaveResult =
  | { ok: true; setup: SupportSetup }
  | { ok: false; reason: string }

const relationships = [
  "Daughter",
  "Son",
  "Partner",
  "Friend",
  "Neighbour",
  "Carer",
  "Community support worker",
  "Other",
]

const usingForLabels: Record<SupportSetup["usingFor"], string> = {
  self: "Myself",
  other: "Someone I care about",
}

const inputClass =
  "h-12 rounded-xl border border-border bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function TrustedSupportDialog({
  open,
  existing,
  signedIn,
  signedInEmail,
  onClose,
  onSignIn,
  onSignOut,
  onCreate,
  onRequestCode,
  onVerifyCode,
  onSaveSetup,
}: {
  open: boolean
  existing: SupportSetup | null
  signedIn: boolean
  signedInEmail: string
  onClose: () => void
  onSignIn: () => void
  onSignOut: () => Promise<AsyncResult>
  onCreate: (support: SupportSetup) => void
  onRequestCode: (email: string) => Promise<AsyncResult>
  onVerifyCode: (email: string, code: string) => Promise<VerifyResult>
  onSaveSetup: (support: SupportSetup & { trustedContactConsent: boolean }) => Promise<SaveResult>
}) {
  const [phase, setPhase] = useState<Phase>("signin")

  // Sign-in step
  const [signInValue, setSignInValue] = useState("")
  const [codeEntry, setCodeEntry] = useState("")
  const [codeError, setCodeError] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Setup form
  const [yourName, setYourName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [usingFor, setUsingFor] = useState<SupportSetup["usingFor"]>("self")
  const [trustedName, setTrustedName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [trustedEmail, setTrustedEmail] = useState("")
  const [trustedPhone, setTrustedPhone] = useState("")
  const [trustedContactConsent, setTrustedContactConsent] = useState(false)
  const [created, setCreated] = useState<SupportSetup | null>(null)

  // When the dialog opens, decide the starting phase from the existing setup.
  useEffect(() => {
    if (open) {
      setCreated(existing)
      setYourName(existing?.yourName ?? "")
      setEmail(existing?.email || signedInEmail)
      setPhone(existing?.phone ?? "")
      setUsingFor(existing?.usingFor ?? "self")
      setTrustedName(existing?.trustedName ?? "")
      setRelationship(existing?.relationship ?? "")
      setTrustedEmail(existing?.trustedEmail ?? "")
      setTrustedPhone(existing?.trustedPhone ?? "")
      setTrustedContactConsent(Boolean(existing?.trustedEmail || existing?.trustedPhone))
      setSignInValue("")
      setCodeEntry("")
      setCodeError(false)
      setStatusMessage("")
      setSubmitting(false)
      // Returning users with a saved setup see their summary; users who are
      // signed in but haven't saved go to the form; otherwise sign in first.
      setPhase(existing ? "summary" : signedIn ? "form" : "signin")
    }
  }, [open, existing, signedIn, signedInEmail])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const canSendCode = signInValue.trim().length >= 3 && !submitting
  const hasDirectTrustedContact = Boolean(trustedEmail.trim() || trustedPhone.trim())
  const canSave =
    yourName.trim().length >= 1 &&
    email.trim().length >= 1 &&
    (!hasDirectTrustedContact || trustedContactConsent)
  const hasTrusted = trustedName.trim().length >= 1

  async function sendCode() {
    if (!canSendCode) return
    setSubmitting(true)
    setStatusMessage("")
    const signInEmail = signInValue.trim()
    const result = await onRequestCode(signInEmail)
    setSubmitting(false)

    if (!result.ok) {
      setStatusMessage(messageForReason(result.reason))
      return
    }

    // Prefill the form's contact field from the sign-in channel.
    setEmail(signInEmail)
    setCodeEntry("")
    setCodeError(false)
    setPhase("code")
  }

  async function verifyCode() {
    setSubmitting(true)
    setStatusMessage("Checking your setup...")
    const result = await onVerifyCode(signInValue.trim(), codeEntry.trim())
    setSubmitting(false)

    if (!result.ok) {
      setCodeError(true)
      setStatusMessage(messageForReason(result.reason))
      return
    }

    setCodeError(false)
    onSignIn()
    setStatusMessage("")

    if (result.setup) {
      applySetup(result.setup)
      setCreated(result.setup)
      onCreate(result.setup)
      setPhase("summary")
      return
    }

    setEmail(result.signedInEmail || signInValue.trim())
    setPhase("form")
  }

  async function save() {
    if (!canSave) return
    const support: SupportSetup = {
      yourName: yourName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      usingFor,
      trustedName: trustedName.trim(),
      relationship: hasTrusted ? relationship || "Other" : "",
      trustedEmail: trustedEmail.trim(),
      trustedPhone: trustedPhone.trim(),
      trustedContactNeedsUpdate: hasTrusted && !trustedEmail.trim() && !trustedPhone.trim(),
    }
    setSubmitting(true)
    setStatusMessage("")
    const result = await onSaveSetup({
      ...support,
      trustedContactConsent: hasDirectTrustedContact ? trustedContactConsent : false,
    })
    setSubmitting(false)

    if (!result.ok) {
      setStatusMessage(messageForReason(result.reason))
      return
    }

    setCreated(result.setup)
    onCreate(result.setup)
    setPhase("summary")
  }

  function applySetup(setup: SupportSetup) {
    setYourName(setup.yourName)
    setEmail(setup.email || signedInEmail)
    setPhone(setup.phone)
    setUsingFor(setup.usingFor)
    setTrustedName(setup.trustedName)
    setRelationship(setup.relationship)
    setTrustedEmail(setup.trustedEmail)
    setTrustedPhone(setup.trustedPhone)
    setTrustedContactConsent(Boolean(setup.trustedEmail || setup.trustedPhone))
  }

  const titles: Record<Phase, string> = {
    signin: "Continue with AskSafe",
    code: "Enter your code",
    form: "Set up AskSafe",
    summary: "My AskSafe setup",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-dialog-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl border border-border bg-card shadow-xl sm:max-h-[88vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (fixed) */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2
              id="support-dialog-title"
              className="font-heading text-2xl font-semibold text-foreground"
            >
              {titles[phase]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Sign-in: send a one-time code */}
        {phase === "signin" && (
          <>
            <div className="flex-1 overflow-y-auto p-6 sm:px-8">
              <form
                id="signin-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  sendCode()
                }}
                className="flex flex-col gap-5"
              >
                <p className="text-base leading-relaxed text-muted-foreground">
                  Use a one-time code so AskSafe can remember your setup and
                  safety checks later. No password needed.
                </p>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="signin-email" className="text-base font-semibold text-foreground">
                    Email address
                  </Label>
                  <input
                    id="signin-email"
                    type="email"
                    autoFocus
                    value={signInValue}
                    onChange={(e) => setSignInValue(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    You can still use AskSafe without setting this up.
                  </p>
                </div>

                {statusMessage && (
                  <p className="text-base font-medium text-destructive">
                    {statusMessage}
                  </p>
                )}
              </form>
            </div>

            {/* Footer (sticky) */}
            <div className="shrink-0 border-t border-border p-6 sm:px-8">
              <Button
                type="submit"
                form="signin-form"
                size="lg"
                disabled={!canSendCode}
                className="h-auto w-full rounded-2xl px-6 py-5 text-lg font-semibold"
              >
                Send me a code
              </Button>
            </div>
          </>
        )}

        {/* Code entry */}
        {phase === "code" && (
          <>
            <div className="flex-1 overflow-y-auto p-6 sm:px-8">
              <form
                id="code-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  verifyCode()
                }}
                className="flex flex-col gap-5"
              >
                <p className="text-base leading-relaxed text-muted-foreground">
                  Enter the 6-digit code to continue.
                </p>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="code-entry" className="text-base font-semibold text-foreground">
                    6-digit code
                  </Label>
                  <input
                    id="code-entry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={codeEntry}
                    onChange={(e) => {
                      setCodeEntry(e.target.value.replace(/\D/g, ""))
                      setCodeError(false)
                    }}
                    placeholder="123456"
                    className={`${inputClass} text-center text-2xl font-bold tracking-[0.4em]`}
                  />
                  {(codeError || statusMessage) && (
                    <p className="text-base font-medium text-destructive">
                      {statusMessage || "That code did not match. Please try again."}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setPhase("signin")}
                  className="inline-flex w-fit items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Use a different contact
                </button>
              </form>
            </div>

            <div className="shrink-0 border-t border-border p-6 sm:px-8">
              <Button
                type="submit"
                form="code-form"
                size="lg"
                disabled={codeEntry.length < 6 || submitting}
                className="h-auto w-full rounded-2xl px-6 py-5 text-lg font-semibold"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Setup form */}
        {phase === "form" && (
          <>
            <div className="flex-1 overflow-y-auto p-6 sm:px-8">
              <form
                id="setup-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  void save()
                }}
                className="flex flex-col gap-6"
              >
                <p className="text-base leading-relaxed text-muted-foreground">
                  A simple setup helps personalize guidance and lets you choose
                  someone you trust if you want a second opinion.
                </p>

                {/* Section 1: About you */}
                <section className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    About you
                  </h3>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="your-name" className="text-base font-semibold text-foreground">
                      Your name or nickname
                    </Label>
                    <input
                      id="your-name"
                      type="text"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                      placeholder="For example, Margaret"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="your-email" className="text-base font-semibold text-foreground">
                      Email address
                    </Label>
                    <input
                      id="your-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="your-phone" className="text-base font-semibold text-foreground">
                      Phone number{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <input
                      id="your-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone number"
                      className={inputClass}
                    />
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Your email helps identify your AskSafe setup. Phone is
                    optional. Nothing is shared unless you choose to share it.
                  </p>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-base font-semibold text-foreground">
                      I am using AskSafe for:
                    </legend>
                    <div className="flex flex-col gap-2">
                      {(Object.keys(usingForLabels) as SupportSetup["usingFor"][]).map((r) => (
                        <label
                          key={r}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-lg transition-colors ${
                            usingFor === r
                              ? "border-primary bg-primary/8 text-foreground"
                              : "border-border bg-background text-foreground hover:bg-secondary"
                          }`}
                        >
                          <input
                            type="radio"
                            name="using-for"
                            value={r}
                            checked={usingFor === r}
                            onChange={() => setUsingFor(r)}
                            className="h-5 w-5 accent-[var(--primary)]"
                          />
                          {usingForLabels[r]}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </section>

                {/* Section 2: Someone you trust */}
                <section className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      Someone you trust
                    </h3>
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                      Optional
                    </span>
                  </div>

                  <p className="text-base leading-relaxed text-muted-foreground">
                    Add a family member, close friend, neighbour, carer, or
                    community support worker if you want support later. AskSafe
                    will not contact them or share anything automatically.
                  </p>

                  {created?.trustedContactNeedsUpdate && (
                    <p className="rounded-xl bg-secondary px-4 py-3 text-base leading-relaxed text-muted-foreground">
                      Add contact details before AskSafe can show a call or email
                      action for {created.trustedName}.
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="trusted-name" className="text-base font-semibold text-foreground">
                      Trusted person&apos;s name
                    </Label>
                    <input
                      id="trusted-name"
                      type="text"
                      value={trustedName}
                      onChange={(e) => setTrustedName(e.target.value)}
                      placeholder="For example, Sarah"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="trusted-relationship" className="text-base font-semibold text-foreground">
                      Relationship
                    </Label>
                    <select
                      id="trusted-relationship"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Choose one</option>
                      {relationships.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="trusted-email" className="text-base font-semibold text-foreground">
                      Trusted person&apos;s email{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <input
                      id="trusted-email"
                      type="email"
                      value={trustedEmail}
                      onChange={(e) => {
                        setTrustedEmail(e.target.value)
                        if (!e.target.value.trim() && !trustedPhone.trim()) {
                          setTrustedContactConsent(false)
                        }
                      }}
                      placeholder="their@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="trusted-phone" className="text-base font-semibold text-foreground">
                      Trusted person&apos;s phone{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <input
                      id="trusted-phone"
                      type="tel"
                      value={trustedPhone}
                      onChange={(e) => {
                        setTrustedPhone(e.target.value)
                        if (!trustedEmail.trim() && !e.target.value.trim()) {
                          setTrustedContactConsent(false)
                        }
                      }}
                      placeholder="Their phone number"
                      className={inputClass}
                    />
                  </div>

                  {hasDirectTrustedContact && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-base leading-relaxed text-foreground">
                      <input
                        type="checkbox"
                        checked={trustedContactConsent}
                        onChange={(e) => setTrustedContactConsent(e.target.checked)}
                        className="mt-1 h-5 w-5 accent-[var(--primary)]"
                      />
                      <span>
                        Save these contact details so I can choose to call or
                        email this person from AskSafe. AskSafe will not contact
                        them for me.
                      </span>
                    </label>
                  )}
                </section>
              </form>
            </div>

            {/* Footer (sticky) */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-border p-6 sm:px-8">
              <Button
                type="submit"
                form="setup-form"
                size="lg"
                disabled={!canSave || submitting}
                className="h-auto rounded-2xl px-6 py-5 text-lg font-semibold"
              >
                Save setup
              </Button>
              {hasDirectTrustedContact && !trustedContactConsent && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tick the consent box before saving trusted contact details.
                </p>
              )}
              {statusMessage && (
                <p className="text-base font-medium text-destructive">
                  {statusMessage}
                </p>
              )}
            </div>
          </>
        )}

        {/* Summary */}
        {phase === "summary" && created && (
          <>
            <div className="flex-1 overflow-y-auto p-6 sm:px-8">
              <div className="flex flex-col gap-5">
                <dl className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-base text-muted-foreground">Your name</dt>
                    <dd className="text-right text-lg font-semibold text-foreground">
                      {created.yourName}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-base text-muted-foreground">Signed in as</dt>
                    <dd className="text-right text-lg font-semibold text-foreground">
                      {created.email || created.phone}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-base text-muted-foreground">Using AskSafe for</dt>
                    <dd className="text-right text-lg font-semibold text-foreground">
                      {usingForLabels[created.usingFor]}
                    </dd>
                  </div>
                  {created.trustedName && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-base text-muted-foreground">Trusted person</dt>
                      <dd className="text-right text-lg font-semibold text-foreground">
                        {created.trustedName}
                      </dd>
                    </div>
                  )}
                  {created.trustedName && created.relationship && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-base text-muted-foreground">Relationship</dt>
                      <dd className="text-right text-lg font-semibold text-foreground">
                        {created.relationship}
                      </dd>
                    </div>
                  )}
                </dl>

                {!created.trustedName && (
                  <p className="text-base leading-relaxed text-muted-foreground">
                    You can add someone you trust later.
                  </p>
                )}

                {created.trustedName && created.trustedContactNeedsUpdate && (
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Add contact details when you want AskSafe to show call or
                    email actions for {created.trustedName}.
                  </p>
                )}

                <p className="text-base font-medium leading-relaxed text-foreground">
                  Nothing is shared unless you choose to share it.
                </p>
              </div>
            </div>

            {/* Footer (sticky) */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-border p-6 sm:px-8">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setPhase("form")}
                className="h-auto rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary"
              >
                Edit setup
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onClose}
                className="h-auto rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary"
              >
                Done
              </Button>
              {signedIn && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    void onSignOut()
                  }}
                  className="h-auto rounded-2xl px-6 py-4 text-lg font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign out
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function messageForReason(reason: string): string {
  switch (reason) {
    case "email-not-configured":
      return "Email sign-in is not configured yet. You can still use AskSafe without setup."
    case "invalid-email":
    case "invalid-payload":
      return "Please check the email address and try again."
    case "invalid-code":
    case "invalid-or-expired-code":
      return "That code did not match or has expired. Please request a new code."
    case "rate-limited":
      return "Too many attempts. Please wait a moment and try again."
    case "not-signed-in":
      return "Please sign in again before saving setup."
    default:
      return "Something went wrong. Please try again."
  }
}
