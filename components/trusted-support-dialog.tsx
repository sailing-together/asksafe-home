"use client"

import { useEffect, useState } from "react"
import { UserRound, Copy, Check, ShieldCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export type SupportSetup = {
  yourName: string
  role: "self" | "helper"
  name: string
  relationship: string
  contact: string
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

const roleLabels: Record<SupportSetup["role"], string> = {
  self: "Checking something for myself",
  helper: "Helping someone I trust",
}

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
  const [role, setRole] = useState<SupportSetup["role"]>("self")
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [contact, setContact] = useState("")
  const [created, setCreated] = useState<SupportSetup | null>(null)
  const [copied, setCopied] = useState(false)

  // When the dialog opens, start from the existing setup (if any).
  useEffect(() => {
    if (open) {
      setCreated(existing)
      setYourName(existing?.yourName ?? "")
      setRole(existing?.role ?? "self")
      setName(existing?.name ?? "")
      setRelationship(existing?.relationship ?? "")
      setContact(existing?.contact ?? "")
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

  function saveSetup(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 1) return
    const support: SupportSetup = {
      yourName: yourName.trim(),
      role,
      name: name.trim(),
      relationship: relationship || "Other",
      contact: contact.trim(),
      // Keep an existing code if there is one, otherwise make a fresh one.
      code: created?.code ?? makeCode(),
    }
    setCreated(support)
    onCreate(support)
  }

  async function copyCode() {
    if (!created) return
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
              {created ? "My support" : "Set up my support"}
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
          <form onSubmit={saveSetup} className="mt-5 flex flex-col gap-5">
            <p className="text-base leading-relaxed text-muted-foreground">
              You can use AskSafe without setting this up. Adding someone you
              trust makes it easier to ask for a second opinion.
            </p>

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
                className="h-12 rounded-xl border border-border bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-base font-semibold text-foreground">
                I am:
              </legend>
              <div className="flex flex-col gap-2">
                {(Object.keys(roleLabels) as SupportSetup["role"][]).map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-lg transition-colors ${
                      role === r
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border bg-background text-foreground hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="support-role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="h-5 w-5 accent-[var(--primary)]"
                    />
                    {roleLabels[r]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <Label htmlFor="trusted-name" className="text-base font-semibold text-foreground">
                Trusted person&apos;s name
              </Label>
              <input
                id="trusted-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="For example, Sarah"
                className="h-12 rounded-xl border border-border bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="h-12 rounded-xl border border-border bg-background px-4 text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <Label htmlFor="trusted-contact" className="text-base font-semibold text-foreground">
                Phone or email{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <input
                id="trusted-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number or email"
                className="h-12 rounded-xl border border-border bg-background px-4 text-lg text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={name.trim().length < 1}
                className="h-auto rounded-2xl px-6 py-5 text-lg font-semibold"
              >
                <ShieldCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                Create support code
              </Button>
              <Button
                type="submit"
                variant="outline"
                size="lg"
                disabled={name.trim().length < 1}
                className="h-auto rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary"
              >
                Save support setup
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
            <dl className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5">
              {created.yourName && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-base text-muted-foreground">Your name</dt>
                  <dd className="text-lg font-semibold text-foreground">{created.yourName}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base text-muted-foreground">Your role</dt>
                <dd className="text-right text-lg font-semibold text-foreground">
                  {roleLabels[created.role]}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base text-muted-foreground">Trusted person</dt>
                <dd className="text-lg font-semibold text-foreground">{created.name}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base text-muted-foreground">Relationship</dt>
                <dd className="text-lg font-semibold text-foreground">{created.relationship}</dd>
              </div>
            </dl>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/25 bg-primary/8 p-6 text-center">
              <span className="text-base text-muted-foreground">
                Support code for {created.name}
              </span>
              <span className="font-heading text-4xl font-bold tracking-wide text-primary">
                {created.code}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-base leading-relaxed text-muted-foreground">
                Share this code only with someone you trust. They can use it
                later to help you review safety checks. This code does not share
                anything by itself.
              </p>
              <p className="text-base font-medium leading-relaxed text-foreground">
                Nothing is shared unless you choose to share it.
              </p>
            </div>

            <div className="flex flex-col gap-3">
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
