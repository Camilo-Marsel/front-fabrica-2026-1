"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCuentasPendientes, aprobarCuenta, rechazarCuenta, type SolicitudPendiente } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { useUserRole, esAdmin } from "@/hooks/use-user-role"
import { toast } from "@/components/ui/sonner"
import { ShieldCheck, CheckCircle, XCircle, Loader2, RefreshCw, Inbox } from "lucide-react"
import { formatCurrency } from "@/lib/format"

export default function AdminCuentasPage() {
  const router = useRouter()
  const userName = useUserName()
  const role = useUserRole()
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [procesando, setProcesando] = useState<number | null>(null)

  const cargar = async () => {
    setIsLoading(true)
    const r = await getCuentasPendientes()
    if (r.error) {
      if (r.status === 401 || r.status === 403) { router.push("/dashboard"); return }
      toast.error(r.error)
    } else {
      setSolicitudes(r.data ?? [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (role && !esAdmin(role)) { router.push("/dashboard"); return }
    if (role) cargar()
  }, [role])

  const handleDecision = async (id: number, accion: "aprobar" | "rechazar") => {
    setProcesando(id)
    const r = accion === "aprobar" ? await aprobarCuenta(id) : await rechazarCuenta(id)
    if (r.error) toast.error(r.error)
    else {
      toast.success(accion === "aprobar" ? "Cuenta aprobada" : "Solicitud rechazada")
      await cargar()
    }
    setProcesando(null)
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Solicitudes de apertura</h1>
              <p className="text-muted-foreground">Cuentas pendientes de aprobación</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={cargar} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : solicitudes.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <Inbox className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {solicitudes.map((s) => (
              <Card key={s.idCuenta} className="border-warning/30 bg-warning/5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{s.nombreCliente}</CardTitle>
                      <CardDescription className="font-mono">{s.numeroCuenta}</CardDescription>
                    </div>
                    <Badge variant="outline" className="border-warning/50 text-warning bg-warning/10">
                      {s.tipo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2 pt-0">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-success to-emerald-600 hover:opacity-90"
                    disabled={procesando === s.idCuenta}
                    onClick={() => handleDecision(s.idCuenta, "aprobar")}
                  >
                    {procesando === s.idCuenta
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><CheckCircle className="mr-1 h-4 w-4" />Aprobar</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={procesando === s.idCuenta}
                    onClick={() => handleDecision(s.idCuenta, "rechazar")}
                  >
                    <XCircle className="mr-1 h-4 w-4" />Rechazar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
