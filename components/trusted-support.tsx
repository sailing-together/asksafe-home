import { UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TrustedSupport({ onOpenSupport }: { onOpenSupport: () => void }) {
  return (
    <section
      aria-labelledby="trusted-support"
      className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserRound className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="trusted-support"
              className="font-heading text-2xl font-semibold text-foreground"
            >
              Trusted Support
            </h2>
            <p className="mt-1 max-w-md text-base leading-relaxed text-muted-foreground">
              It&apos;s your choice whether to involve anyone. If you&apos;d
              like a second opinion, reach someone you trust — you never have to
              decide alone.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onOpenSupport}
          className="h-auto shrink-0 rounded-2xl border-primary/30 bg-card px-6 py-5 text-lg font-semibold text-primary hover:bg-secondary"
        >
          <UserRound className="mr-2 h-5 w-5" aria-hidden="true" />
          Talk to someone I trust
        </Button>
      </div>
    </section>
  )
}
