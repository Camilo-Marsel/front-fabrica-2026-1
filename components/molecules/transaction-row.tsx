import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react"
import { GlowIcon } from "@/components/atoms/glow-icon"
import { Amount } from "@/components/atoms/amount"
import { formatDate } from "@/lib/format"
import type { Transaccion } from "@/lib/api"

interface TransactionRowProps {
  transaction: Transaccion
}

function resolveVariant(tipo: string) {
  const t = tipo.toUpperCase()
  if (t.includes("DEPOSITO") || t.includes("TRANSFERENCIA_RECIBIDA")) return { icon: ArrowDownLeft, variant: "success" as const }
  if (t.includes("RETIRO"))                                             return { icon: ArrowUpRight,  variant: "destructive" as const }
  return                                                                       { icon: RefreshCw,     variant: "accent" as const }
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const { icon, variant } = resolveVariant(transaction.tipo)

  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-3 last:border-0 last:pb-0 first:pt-0">
      <GlowIcon icon={icon} variant={variant} size="md" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{transaction.concepto}</p>
        <p className="text-xs text-muted-foreground">{formatDate(transaction.fecha)}</p>
      </div>
      <Amount value={transaction.monto} signed size="sm" />
    </div>
  )
}
