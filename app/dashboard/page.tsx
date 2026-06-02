"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BalanceCard } from "@/components/organisms/balance-card"
import { QuickActionsBar } from "@/components/organisms/quick-actions-bar"
import { TransactionPanel } from "@/components/organisms/transaction-panel"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { getDashboard, getTransacciones, getPerfil, type Cuenta, type Transaccion } from "@/lib/api"
import { toast } from "@/components/ui/sonner"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [userName, setUserName] = useState("Usuario")

  useEffect(() => {
    async function loadData() {
      const [cuentasResult, perfilResult] = await Promise.all([
        getDashboard(),
        getPerfil(),
      ])

      if (cuentasResult.error) {
        if (cuentasResult.status === 401) {
          router.push("/login")
          return
        }
        toast.error(cuentasResult.error)
        setIsLoading(false)
        return
      }

      if (perfilResult.data?.nombre) {
        setUserName(perfilResult.data.nombre)
      }

      if (cuentasResult.data && cuentasResult.data.length > 0) {
        setCuentas(cuentasResult.data)
        const transResult = await getTransacciones(cuentasResult.data[0].id)
        if (transResult.data) setTransacciones(transResult.data.slice(0, 5))
      }

      setIsLoading(false)
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <DashboardLayout userName={userName}>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6">
        {/* Balance cards */}
        {cuentas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cuentas.map((cuenta) => (
              <BalanceCard key={cuenta.id} cuenta={cuenta} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <p className="text-muted-foreground">No tienes cuentas asociadas</p>
          </div>
        )}

        {/* Quick actions */}
        <QuickActionsBar />

        {/* Recent transactions */}
        <TransactionPanel
          transactions={transacciones}
          showViewAll={transacciones.length > 0}
          onViewAll={() => router.push("/movimientos")}
        />
      </div>
    </DashboardLayout>
  )
}
