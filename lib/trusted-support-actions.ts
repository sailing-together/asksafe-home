export type TrustedContactForAction = {
  trustedName: string
  trustedPhone: string
  trustedEmail: string
  trustedContactNeedsUpdate: boolean
}

export type TrustedSupportAction =
  | { kind: "call"; label: string; href: string }
  | { kind: "email"; label: string; href: string }
  | { kind: "add-contact"; label: string }
  | { kind: "add-contact-details"; label: string }

export function getTrustedSupportActions(
  support: TrustedContactForAction | null,
): TrustedSupportAction[] {
  const name = support?.trustedName.trim() ?? ""
  if (!name) {
    return [{ kind: "add-contact", label: "Add someone I trust" }]
  }

  const actions: TrustedSupportAction[] = []
  const phone = toTelHref(support?.trustedPhone ?? "")
  const email = support?.trustedEmail.trim() ?? ""

  if (phone) actions.push({ kind: "call", label: `Call ${name}`, href: phone })
  if (email) actions.push({ kind: "email", label: `Email ${name}`, href: `mailto:${email}` })

  if (actions.length > 0) return actions

  return [{ kind: "add-contact-details", label: `Add ${name}'s contact details` }]
}

function toTelHref(value: string): string | null {
  const normalized = value.trim().replace(/[^\d+]/g, "")
  return normalized ? `tel:${normalized}` : null
}
