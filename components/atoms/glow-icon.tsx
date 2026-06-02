import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface GlowIconProps {
  icon: LucideIcon
  /** Color de fondo y glow: usa clases de Tailwind como "primary", "success", "destructive", "accent", "warning" */
  variant?: "primary" | "success" | "destructive" | "accent" | "warning" | "muted"
  size?: "sm" | "md" | "lg"
  className?: string
}

const variantMap = {
  primary:     { bg: "bg-primary/15",     icon: "text-primary",     glow: "shadow-[0_0_12px_oklch(0.585_0.233_277/0.3)]" },
  success:     { bg: "bg-success/15",     icon: "text-success",     glow: "shadow-[0_0_12px_oklch(0.70_0.17_162/0.3)]"  },
  destructive: { bg: "bg-destructive/15", icon: "text-destructive", glow: "" },
  accent:      { bg: "bg-accent/15",      icon: "text-accent",      glow: "shadow-[0_0_12px_oklch(0.585_0.241_293/0.3)]" },
  warning:     { bg: "bg-warning/15",     icon: "text-warning",     glow: "" },
  muted:       { bg: "bg-muted",          icon: "text-muted-foreground", glow: "" },
}

const sizeMap = {
  sm: { wrapper: "h-8 w-8 rounded-lg",  icon: "h-4 w-4" },
  md: { wrapper: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { wrapper: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
}

export function GlowIcon({ icon: Icon, variant = "primary", size = "md", className }: GlowIconProps) {
  const v = variantMap[variant]
  const s = sizeMap[size]

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        s.wrapper, v.bg, v.glow,
        className
      )}
    >
      <Icon className={cn(s.icon, v.icon)} />
    </div>
  )
}
