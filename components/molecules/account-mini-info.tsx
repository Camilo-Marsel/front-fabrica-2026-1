import { maskAccountNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

interface AccountMiniInfoProps {
  numeroCuenta: string
  tipoCuenta: string
  className?: string
}

export function AccountMiniInfo({ numeroCuenta, tipoCuenta, className }: AccountMiniInfoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <span className="font-medium text-foreground/80">{tipoCuenta}</span>
      <span className="text-border">·</span>
      <span className="font-mono">{maskAccountNumber(numeroCuenta)}</span>
    </div>
  )
}
