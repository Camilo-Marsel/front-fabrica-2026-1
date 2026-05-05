"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AccountCard } from "@/components/dashboard/account-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TransactionList } from "@/components/dashboard/transaction-list"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { getDashboard, getTransacciones, type Cuenta, type Transaccion } from "@/lib/api"
import { toast } from "@/components/ui/sonner"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [userName, setUserName] = useState("Usuario")

  useEffect(() => {
    async function loadData() {
      const cuentasResult = await getDashboard()

      if (cuentasResult.error) {
        if (cuentasResult.status === 401) {
          router.push("/login")
          return
        }
        toast.error(cuentasResult.error)
        setIsLoading(false)
        return
      }

      if (cuentasResult.data && cuentasResult.data.length > 0) {
        setCuentas(cuentasResult.data)

        // Get transactions for the first account
        const transResult = await getTransacciones(cuentasResult.data[0].id)
        if (transResult.data) {
          setTransacciones(transResult.data.slice(0, 5))
        }

        // Try to get user name from profile (endpoint may not exist yet)
        // For now, use a placeholder
        setUserName("Usuario")
      }

      setIsLoading(false)
    }

    loadData()
  }, [router])

  const handleViewAll = () => {
    router.push("/movimientos")
  }

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
        {/* Account Cards */}
        {cuentas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cuentas.map((cuenta) => (
              <AccountCard key={cuenta.id} cuenta={cuenta} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No tienes cuentas asociadas</p>
          </div>
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions */}
        <TransactionList
          transactions={transacciones}
          showViewAll={transacciones.length > 0}
          onViewAll={handleViewAll}
        />
      </div>
    </DashboardLayout>
  )
}
