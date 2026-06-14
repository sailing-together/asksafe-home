import { UserRound } from "lucide-react"
import { ShieldLogo } from "@/components/shield-logo"
import { Button } from "@/components/ui/button"

export function AppHeader({ onOpenSupport }: { onOpenSupport: () => void }) {
  return (
    <header className="border-b border-border bg-card/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
        <ShieldLogo className="h-14 w-14 -my-1" />
        <div className="leading-tight">
          <p className="font-heading text-xl font-semibold text-primary">
            AskSafe Home
          </p>
          <p className="text-sm text-muted-foreground">
            Your calm decision companion
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenSupport}
          className="ml-auto h-auto rounded-xl border-primary/30 bg-card px-4 py-2.5 text-base font-semibold text-primary hover:bg-secondary"
        >
          <UserRound className="mr-2 h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">My setup</span>
          <span className="sm:hidden">Setup</span>
        </Button>
      </div>
    </header>
  )
}
