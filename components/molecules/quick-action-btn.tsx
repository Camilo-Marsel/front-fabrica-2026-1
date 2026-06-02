import Link from "next/link"
import { GlowIcon } from "@/components/atoms/glow-icon"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type QuickActionVariant = "primary" | "success" | "destructive" | "accent" | "warning" | "muted"

interface QuickActionBtnProps {
  href: string
  label: string
  icon: LucideIcon
  variant?: QuickActionVariant
  className?: string
}

export function QuickActionBtn({ href, label, icon, variant = "primary", className }: QuickActionBtnProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-2.5 rounded-xl border border-border/50 bg-card p-4 text-center",
        "transition-all duration-150 hover:border-primary/30 hover:bg-secondary",
        className
      )}
    >
      <GlowIcon icon={icon} variant={variant} size="lg" />
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </Link>
  )
}
