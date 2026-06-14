import { Phone, ExternalLink, AlertTriangle } from "lucide-react"

interface Resource {
  name: string
  description: string
  phone?: string
  phoneLabel?: string
  url?: string
  urlLabel?: string
  urgent?: boolean
}

const resources: Resource[] = [
  {
    name: "Emergency — immediate danger",
    description: "If you or someone else is in danger right now.",
    phone: "000",
    phoneLabel: "Call 000",
    urgent: true,
  },
  {
    name: "Scamwatch (National Anti-Scam Centre)",
    description: "Report a scam and check the latest scam warnings.",
    url: "https://www.scamwatch.gov.au",
    urlLabel: "scamwatch.gov.au",
  },
  {
    name: "IDCARE",
    description:
      "Free help if you've shared personal details or think your identity is at risk.",
    phone: "1800595160",
    phoneLabel: "1800 595 160",
  },
  {
    name: "Police Assistance Line",
    description: "Report non-urgent crime or get advice from police.",
    phone: "131444",
    phoneLabel: "131 444",
  },
  {
    name: "Older Persons Advocacy Network",
    description: "Confidential support and advice for older Australians.",
    phone: "1800353374",
    phoneLabel: "1800 353 374",
  },
  {
    name: "Lifeline",
    description: "Someone to talk to, any time, if you're feeling distressed.",
    phone: "131114",
    phoneLabel: "13 11 14",
  },
]

export function OfficialHelp() {
  return (
    <section aria-labelledby="official-help" className="flex flex-col gap-5">
      <div className="text-center">
        <h2
          id="official-help"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          Official help in Australia
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Trusted services you can contact directly, any time.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <li
            key={r.name}
            className={`flex flex-col gap-3 rounded-2xl border p-5 ${
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
            {r.phone && (
              <a
                href={`tel:${r.phone}`}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary/70"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                {r.phoneLabel}
              </a>
            )}
            {r.url && (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary/70"
              >
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
                {r.urlLabel}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
