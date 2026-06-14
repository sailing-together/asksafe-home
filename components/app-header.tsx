import { UserRound } from "lucide-react"
import { ShieldLogo } from "@/components/shield-logo"
import { Button } from "@/components/ui/button"

export function AppHeader({
  signedIn,
  firstName,
  onHome,
  onOpenSupport,
}: {
  signedIn: boolean
  firstName: string
  onHome: () => void
  onOpenSupport: () => void
}) {
  const label = signedIn ? firstName.trim() || "Signed in" : "My setup"

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onHome}
          aria-label="Go to AskSafe Home"
          className="-ml-1 flex items-center gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShieldLogo className="h-14 w-14 -my-1" />
          <span className="leading-tight">
            <span className="block font-heading text-xl font-semibold text-primary">
              AskSafe Home
            </span>
            <span className="block text-sm text-muted-foreground">
              Your calm decision companion
            </span>
          </span>
        </button>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenSupport}
          aria-label={signedIn ? `Signed in as ${label}. Open my setup.` : "My setup"}
          className="ml-auto h-auto rounded-xl border-primary/30 bg-card px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary"
        >
          <UserRound className="mr-2 h-5 w-5" aria-hidden="true" />
          <span className="max-w-[8rem] truncate">{label}</span>
        </Button>
      </div>
    </header>
  )
}
