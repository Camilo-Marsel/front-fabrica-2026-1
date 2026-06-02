import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVA: {
    label: "● Activa",
    classes: "bg-success/15 text-success border border-success/20",
  },
  INACTIVA: {
    label: "● Inactiva",
    classes: "bg-muted text-muted-foreground border border-border",
  },
  BLOQUEADA: {
    label: "⊘ Bloqueada",
    classes: "bg-destructive/15 text-destructive border border-destructive/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    classes: "bg-muted text-muted-foreground border border-border",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
