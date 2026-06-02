import { CreditCard } from "lucide-react"
import { Amount } from "@/components/atoms/amount"
import { StatusBadge } from "@/components/atoms/status-badge"
import { AccountMiniInfo } from "@/components/molecules/account-mini-info"
import type { Cuenta } from "@/lib/api"

interface BalanceCardProps {
  cuenta: Cuenta
}

export function BalanceCard({ cuenta }: BalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-6 shadow-[0_8px_32px_oklch(0.585_0.233_277/0.35)]">
      {/* decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-6 right-10 h-20 w-20 rounded-full bg-white/[0.03]" />

      <div className="relative z-10">
        {/* header row */}
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Saldo disponible
          </p>
          <CreditCard className="h-6 w-6 text-white/40" />
        </div>

        {/* balance */}
        <div className="mt-3">
          <Amount value={cuenta.saldo} size="xl" className="text-white" />
          <p className="mt-0.5 text-xs text-white/50">COP</p>
        </div>

        {/* divider */}
        <div className="my-4 h-px bg-white/10" />

        {/* account info + status */}
        <div className="flex items-center justify-between">
          <AccountMiniInfo
            numeroCuenta={cuenta.numeroCuenta}
            tipoCuenta={cuenta.tipoCuenta}
            className="text-white/60 [&>span]:text-white/80"
          />
          <StatusBadge status={cuenta.estado} />
        </div>
      </div>
    </div>
  )
}
