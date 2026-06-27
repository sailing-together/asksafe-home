import { Phone, ExternalLink, AlertTriangle, ShieldAlert } from "lucide-react"
import { getOfficialHelpResources } from "@/lib/official-help-resources"

export function OfficialHelp({
  ids,
  title = "Official help in Australia",
  description = "Trusted Australian services you can contact yourself to check, report, or get support — whenever you decide to.",
  showReminder = false,
}: {
  ids?: string[]
  title?: string
  description?: string
  showReminder?: boolean
}) {
  const list = getOfficialHelpResources(ids)

  return (
    <section aria-labelledby="official-help" className="flex flex-col gap-5">
      <div className="text-center">
        <h2
          id="official-help"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          {title}
        </h2>
        <p className="mt-1 text-base text-muted-foreground">{description}</p>
      </div>

      {showReminder && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-5">
          <ShieldAlert
            className="mt-0.5 h-6 w-6 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p className="text-base font-medium leading-relaxed text-foreground">
            Verify through a channel you already trust. Don&apos;t call numbers
            or tap links from the message itself — use the official contacts
            below, which you can look up on your own.
          </p>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {list.map((r) => (
          <li
            key={r.id}
            className={`flex h-full min-h-44 flex-col gap-4 rounded-2xl border p-5 ${
              r.urgent
                ? "border-accent/40 bg-accent/10"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-3">
              {r.urgent && (
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                  aria-hidden="true"
                />
              )}
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {r.name}
                </h3>
                <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                  {r.description}
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-3">
              {r.phone && (
                <a
                  href={`tel:${r.phone}`}
                  className="inline-flex min-h-11 w-fit max-w-full items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary/70"
                >
                  <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {r.phoneLabel}
                    {r.phoneLabelExtra && (
                      <span className="hidden sm:inline">
                        {" "}
                        {r.phoneLabelExtra}
                      </span>
                    )}
                  </span>
                </a>
              )}
              {r.url && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary/70"
                >
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  {r.urlLabel}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
