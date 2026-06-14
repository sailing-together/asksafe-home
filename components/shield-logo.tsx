import Image from "next/image"
import { cn } from "@/lib/utils"

export function ShieldLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      aria-hidden="true"
    >
      <Image
        src="/asksafe-logo.png"
        alt=""
        fill
        sizes="64px"
        className="object-contain"
        priority
      />
    </span>
  )
}
