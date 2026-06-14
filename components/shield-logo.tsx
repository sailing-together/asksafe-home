import { cn } from "@/lib/utils"

export function ShieldLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[60%] w-[60%]"
      >
        <path d="M12 2.5 4.5 5.5v5.2c0 4.6 3.1 8.3 7.5 9.8 4.4-1.5 7.5-5.2 7.5-9.8V5.5L12 2.5Z" />
        <path d="m8.8 12 2.2 2.2 4.2-4.4" className="text-accent" />
      </svg>
    </span>
  )
}
