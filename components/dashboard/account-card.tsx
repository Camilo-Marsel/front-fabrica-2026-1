"use client"

import { Card } from "@/components/ui/card"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { CreditCard } from "lucide-react"
import type { Cuenta } from "@/lib/api"

interface AccountCardProps {
  cuenta: Cuenta
}

export function AccountCard({ cuenta }: AccountCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary p-6 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">
              {cuenta.tipoCuenta}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-wider">
              {maskAccountNumber(cuenta.numeroCuenta)}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-primary-foreground/60" />
        </div>
        <div className="mt-6">
          <p className="text-sm text-primary-foreground/80">Saldo disponible</p>
          <p className="mt-1 text-3xl font-bold">{formatCurrency(cuenta.saldo)}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              cuenta.estado === "ACTIVA"
                ? "bg-success/20 text-success-foreground"
                : "bg-destructive/20 text-destructive-foreground"
            }`}
          >
            {cuenta.estado}
          </span>
        </div>
      </div>
    </Card>
  )
}
