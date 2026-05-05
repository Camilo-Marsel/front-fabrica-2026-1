"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react"
import type { Transaccion } from "@/lib/api"

interface TransactionListProps {
  transactions: Transaccion[]
  title?: string
  showViewAll?: boolean
  onViewAll?: () => void
}

function getTransactionIcon(tipo: string) {
  switch (tipo.toUpperCase()) {
    case "DEPOSITO":
      return <ArrowDownLeft className="h-5 w-5 text-success" />
    case "RETIRO":
      return <ArrowUpRight className="h-5 w-5 text-destructive" />
    case "TRANSFERENCIA":
      return <RefreshCw className="h-5 w-5 text-accent" />
    default:
      return <RefreshCw className="h-5 w-5 text-muted-foreground" />
  }
}

export function TransactionList({
  transactions,
  title = "Últimos movimientos",
  showViewAll = false,
  onViewAll,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No hay movimientos para mostrar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-accent hover:underline"
          >
            Ver todo
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getTransactionIcon(transaction.tipo)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{transaction.concepto}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.fecha)}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  transaction.monto >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {transaction.monto >= 0 ? "+" : ""}
                {formatCurrency(transaction.monto)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
