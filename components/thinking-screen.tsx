import { ShieldLogo } from "@/components/shield-logo"

export function ThinkingScreen() {
  const steps = [
    "Reading what you shared",
    "Looking for common scam signs",
    "Working out your safer next step",
  ]

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8 pt-6 pb-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute h-28 w-28 animate-ping rounded-full bg-accent/20" />
        <span className="absolute h-28 w-28 rounded-full bg-accent/10" />
        <ShieldLogo className="relative h-20 w-20" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Taking a careful look
        </h1>
        <p className="text-lg text-muted-foreground">
          This only takes a moment.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li
            key={step}
            className="flex items-center gap-3 text-lg text-foreground"
            style={{ animation: "asksafe-fade 0.5s ease both", animationDelay: `${i * 0.45}s` }}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}
