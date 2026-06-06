"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getReporte, exportarCSV, type ReporteResumen } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { useUserRole, esAdmin } from "@/hooks/use-user-role"
import { formatCurrency } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { BarChart3, Download, Loader2, TrendingUp, Hash } from "lucide-react"

export default function AdminReportesPage() {
  const router = useRouter()
  const userName = useUserName()
  const role = useUserRole()
  const [inicio, setInicio] = useState(() => {
    const d = new Date(); d.setDate(1)
    return d.toISOString().slice(0, 16)
  })
  const [fin, setFin] = useState(() => new Date().toISOString().slice(0, 16))
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [reporte, setReporte] = useState<ReporteResumen | null>(null)

  useEffect(() => {
    if (role && !esAdmin(role)) router.push("/dashboard")
  }, [role])

  const toBackendDate = (val: string) => val.replace("T", "T").padEnd(19, ":00")

  const handleGenerar = async () => {
    setIsLoading(true)
    const r = await getReporte(
      `${inicio}:00`,
      `${fin}:00`
    )
    if (r.error) toast.error(r.error)
    else setReporte(r.data!)
    setIsLoading(false)
  }

  const handleExportar = async () => {
    setIsExporting(true)
    await exportarCSV(`${inicio}:00`, `${fin}:00`)
    toast.success("CSV descargado")
    setIsExporting(false)
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15">
            <BarChart3 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reportes del sistema</h1>
            <p className="text-muted-foreground">Actividad transaccional por rango de fechas</p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha inicio</Label>
                <Input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className="bg-secondary border-border/50" />
              </div>
              <div className="space-y-2">
                <Label>Fecha fin</Label>
                <Input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} className="bg-secondary border-border/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-success to-emerald-600 hover:opacity-90" onClick={handleGenerar} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</> : "Generar reporte"}
              </Button>
              <Button variant="outline" className="gap-2 border-border/50" onClick={handleExportar} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {reporte && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Transacciones</p>
                    <p className="text-2xl font-bold text-foreground">{reporte.totalTransacciones}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-success/20 bg-success/5">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Volumen total</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(reporte.volumenTotal)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {reporte.transacciones?.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Detalle de transacciones</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
                    {reporte.transacciones.map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-6 py-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">{t.concepto}</p>
                          <p className="text-xs font-mono text-muted-foreground">{t.cuenta}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatCurrency(t.monto)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.fecha).toLocaleDateString("es-CO")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
