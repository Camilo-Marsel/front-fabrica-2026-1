"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buscarPorDocumento, buscarPorCuenta, type ClienteActividad } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { useUserRole, esAdmin } from "@/hooks/use-user-role"
import { formatCurrency } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { Users, Search, Loader2, FileSearch } from "lucide-react"

export default function AdminClientesPage() {
  const router = useRouter()
  const userName = useUserName()
  const role = useUserRole()
  const [modo, setModo] = useState<"documento" | "cuenta">("documento")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resultado, setResultado] = useState<ClienteActividad | null>(null)

  useEffect(() => {
    if (role && !esAdmin(role)) router.push("/dashboard")
  }, [role])

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsLoading(true)
    setResultado(null)
    const r = modo === "documento" ? await buscarPorDocumento(query) : await buscarPorCuenta(query)
    if (r.error) toast.error(r.error)
    else setResultado(r.data!)
    setIsLoading(false)
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Actividad de clientes</h1>
            <p className="text-muted-foreground">Consulta el historial financiero de un cliente</p>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleBuscar} className="space-y-4">
              <div className="flex gap-2">
                {(["documento", "cuenta"] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={modo === m ? "default" : "outline"}
                    onClick={() => { setModo(m); setQuery(""); setResultado(null) }}
                  >
                    {m === "documento" ? "Por documento" : "Por número de cuenta"}
                  </Button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label>{modo === "documento" ? "Número de documento" : "Número de cuenta"}</Label>
                  <Input
                    placeholder={modo === "documento" ? "1234567890" : "12345678"}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-secondary border-border/50"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isLoading || !query.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {resultado && (
          <div className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Información del cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Nombre</p><p className="font-semibold">{resultado.cliente.nombre}</p></div>
                <div><p className="text-muted-foreground">Documento</p><p className="font-mono font-semibold">{resultado.cliente.documento}</p></div>
                <div><p className="text-muted-foreground">Cuenta</p><p className="font-mono font-semibold">{resultado.cliente.numeroCuenta}</p></div>
                <div><p className="text-muted-foreground">Estado</p>
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${resultado.cliente.estadoCuenta === "ACTIVA" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {resultado.cliente.estadoCuenta}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileSearch className="h-4 w-4" />
                    Movimientos
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{resultado.totalMovimientos} registros</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {resultado.movimientos.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Sin movimientos</p>
                ) : (
                  <div className="divide-y divide-border/50">
                    {resultado.movimientos.map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-6 py-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">{m.concepto}</p>
                          <p className="text-xs text-muted-foreground">{new Date(m.fechaHora).toLocaleString("es-CO")}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${m.monto >= 0 ? "text-success" : "text-destructive"}`}>
                            {m.monto >= 0 ? "+" : ""}{formatCurrency(Math.abs(m.monto))}
                          </p>
                          <p className="text-xs text-muted-foreground">{m.estado}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
