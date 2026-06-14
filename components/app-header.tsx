import { ShieldLogo } from "@/components/shield-logo"

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
        <ShieldLogo className="h-14 w-14 -my-1" />
        <div className="leading-tight">
          <p className="font-heading text-xl font-semibold text-foreground">
            AskSafe Home
          </p>
          <p className="text-sm text-muted-foreground">
            Your calm decision companion
          </p>
        </div>
      </div>
    </header>
  )
}
