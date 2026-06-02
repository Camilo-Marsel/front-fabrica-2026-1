import { TransactionRow } from "@/components/molecules/transaction-row"
import type { Transaccion } from "@/lib/api"

interface TransactionPanelProps {
  transactions: Transaccion[]
  title?: string
  showViewAll?: boolean
  onViewAll?: () => void
}

export function TransactionPanel({
  transactions,
  title = "Últimos movimientos",
  showViewAll = false,
  onViewAll,
}: TransactionPanelProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card">
      {/* panel header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-primary hover:text-accent transition-colors"
          >
            Ver todo →
          </button>
        )}
      </div>

      {/* rows */}
      <div className="px-5 py-2">
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay movimientos para mostrar
          </p>
        ) : (
          transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
      </div>
    </div>
  )
}
