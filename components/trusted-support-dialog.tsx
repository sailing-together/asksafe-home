"use client"

import { useEffect, useState } from "react"
import { UserRound, Copy, Check, ShieldCheck, X } from "lucide-react"
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
  code: string
}

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

function makeCode() {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `SAFE-${digits}`
}

export function TrustedSupportDialog({
  open,
  existing,
  onClose,
  onCreate,
}: {
  open: boolean
  existing: SupportSetup | null
  onClose: () => void
  onCreate: (support: SupportSetup) => void
}) {
  const [yourName, setYourName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [usingFor, setUsingFor] = useState<SupportSetup["usingFor"]>("self")
  const [trustedName, setTrustedName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [trustedEmail, setTrustedEmail] = useState("")
  const [trustedPhone, setTrustedPhone] = useState("")
  const [created, setCreated] = useState<SupportSetup | null>(null)
  const [copied, setCopied] = useState(false)

  // When the dialog opens, start from the existing setup (if any).
  useEffect(() => {
    if (open) {
      setCreated(existing)
      setYourName(existing?.yourName ?? "")
      setEmail(existing?.email ?? "")
      setPhone(existing?.phone ?? "")
      setUsingFor(existing?.usingFor ?? "self")
      setTrustedName(existing?.trustedName ?? "")
      setRelationship(existing?.relationship ?? "")
      setTrustedEmail(existing?.trustedEmail ?? "")
      setTrustedPhone(existing?.trustedPhone ?? "")
      setCopied(false)
    }
  }, [open, existing])

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

  const canSave = yourName.trim().length >= 1 && email.trim().length >= 1
  const hasTrusted = trustedName.trim().length >= 1

  function save(withCode: boolean) {
    if (!canSave) return
    if (withCode && !hasTrusted) return
    const support: SupportSetup = {
      yourName: yourName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      usingFor,
      trustedName: trustedName.trim(),
      relationship: hasTrusted ? relationship || "Other" : "",
      trustedEmail: trustedEmail.trim(),
      trustedPhone: trustedPhone.trim(),
      // Keep an existing code, make a new one when asked, otherwise none.
      code: withCode ? created?.code ?? makeCode() : created?.code ?? "",
    }
    setCreated(support)
    onCreate(support)
  }

  async function copyCode() {
    if (!created?.code) return
    try {
      await navigator.clipboard.writeText(created.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
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
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2
              id="support-dialog-title"
              className="font-heading text-2xl font-semibold text-foreground"
            >
              {created ? "My AskSafe setup" : "Set up AskSafe"}
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

        {!created ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              save(false)
            }}
            className="mt-5 flex flex-col gap-6"
          >
            <p className="text-base leading-relaxed text-muted-foreground">
              You can use AskSafe without a full account. A simple setup helps
              personalize guidance and lets you choose someone you trust if you
              want a second opinion.
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
                Your email helps identify your AskSafe setup. Phone is optional.
                Nothing is shared unless you choose to share it.
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
                community support worker if you want support later.
              </p>

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
                  onChange={(e) => setTrustedEmail(e.target.value)}
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
                  onChange={(e) => setTrustedPhone(e.target.value)}
                  placeholder="Their phone number"
                  className={inputClass}
                />
              </div>
            </section>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={!canSave}
                className="h-auto rounded-2xl px-6 py-5 text-lg font-semibold"
              >
                Save setup
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={!canSave || !hasTrusted}
                onClick={() => save(true)}
                className="h-auto rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary"
              >
                <ShieldCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                Create support code
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
            <dl className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base text-muted-foreground">Your name</dt>
                <dd className="text-right text-lg font-semibold text-foreground">
                  {created.yourName}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base text-muted-foreground">Email</dt>
                <dd className="text-right text-lg font-semibold text-foreground">
                  {created.email}
                </dd>
              </div>
              {created.phone && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-base text-muted-foreground">Phone</dt>
                  <dd className="text-right text-lg font-semibold text-foreground">
                    {created.phone}
                  </dd>
                </div>
              )}
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
              {created.code && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-base text-muted-foreground">Support code</dt>
                  <dd className="text-right font-heading text-lg font-bold tracking-wide text-primary">
                    {created.code}
                  </dd>
                </div>
              )}
            </dl>

            {!created.trustedName && (
              <p className="text-base leading-relaxed text-muted-foreground">
                You can add someone you trust later.
              </p>
            )}

            {created.code && (
              <p className="text-base leading-relaxed text-muted-foreground">
                This code does not share anything by itself.
              </p>
            )}

            <p className="text-base font-medium leading-relaxed text-foreground">
              Nothing is shared unless you choose to share it.
            </p>

            <div className="flex flex-col gap-3">
              {created.code && (
                <Button
                  type="button"
                  size="lg"
                  onClick={copyCode}
                  className="h-auto rounded-2xl px-6 py-5 text-lg font-semibold"
                >
                  {copied ? (
                    <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Copy className="mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy support code"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setCreated(null)}
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
