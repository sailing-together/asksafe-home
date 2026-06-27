import { ShieldLogo } from "@/components/shield-logo"
import { getOfficialHelpResources } from "@/lib/official-help-resources"

const footerLinks = ["Privacy", "Disclaimer", "Accessibility", "GitHub"]
const officialHelpIds = ["emergency", "scamwatch", "idcare", "acsc"]

export function SiteFooter() {
  const officialHelp = getOfficialHelpResources(officialHelpIds)

  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <ShieldLogo className="h-9 w-9" />
          <p className="font-heading text-lg font-semibold text-primary">
            AskSafe Home
          </p>
        </div>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          A calm decision companion for moments of uncertainty.
        </p>

        {/* Plain-language safety notices */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm leading-relaxed text-foreground">
            AskSafe is not an emergency service, government service, legal
            adviser, financial adviser, or medical adviser. Do not enter
            passwords, one-time codes, full card numbers, or sensitive identity
            details.
          </p>
        </div>

        {/* Official help */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-foreground">Official help</p>
          <ul className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
            {officialHelp.map((resource, index) => (
              <li key={resource.id} className="flex items-center gap-2">
                {index > 0 && (
                  <span aria-hidden="true" className="text-border">
                    ·
                  </span>
                )}
                <a
                  href={
                    resource.url ??
                    (resource.phone ? `tel:${resource.phone}` : undefined)
                  }
                  target={resource.url ? "_blank" : undefined}
                  rel={resource.url ? "noopener noreferrer" : undefined}
                  className="hover:text-primary hover:underline"
                >
                  {resource.id === "emergency"
                    ? "Emergency 000"
                    : resource.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links (rendered as plain text until pages exist) */}
        <ul className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
          {footerLinks.map((label, index) => (
            <li key={label} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-border">
                  ·
                </span>
              )}
              <span>{label}</span>
            </li>
          ))}
        </ul>

        {/* Copyright */}
        <p className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
          © 2026 AskSafe Home.
        </p>
      </div>
    </footer>
  )
}
