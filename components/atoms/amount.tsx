import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface AmountProps {
  value: number
  /** Muestra signo + para positivos y colorea según dirección */
  signed?: boolean
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "text-sm font-semibold",
  md: "text-base font-semibold",
  lg: "text-2xl font-bold",
  xl: "text-3xl font-extrabold tracking-tight",
}

export function Amount({ value, signed = false, size = "md", className }: AmountProps) {
  const isPositive = value >= 0
  const colorClass = signed
    ? isPositive
      ? "text-success"
      : "text-destructive"
    : "text-foreground"

  const prefix = signed && isPositive ? "+" : ""

  return (
    <span className={cn(sizeMap[size], colorClass, className)}>
      {prefix}{formatCurrency(value)}
    </span>
  )
}
