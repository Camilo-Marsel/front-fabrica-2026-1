"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDashboard, getExtracto, type Cuenta, type Extracto } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { FileText, Loader2 } from "lucide-react"

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

export default function ExtractoPage() {
  const router = useRouter()
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState("")
  const [anio, setAnio] = useState(new Date().getFullYear().toString())
  const [mes, setMes] = useState((new Date().getMonth() + 1).toString())
  const [extracto, setExtracto] = useState<Extracto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  const anios = Array.from({ length: 3 }, (_, i) => (new Date().getFullYear() - i).toString())

  useEffect(() => {
    getDashboard().then((r) => {
      if (r.error) { if (r.status === 401) router.push("/login"); return }
      if (r.data?.length) { setCuentas(r.data); setSelectedCuenta(r.data[0].id.toString()) }
      setIsLoading(false)
    })
  }, [router])

  const buscar = async () => {
    if (!selectedCuenta) return
    setIsFetching(true)
    const r = await getExtracto(parseInt(selectedCuenta), parseInt(anio), parseInt(mes))
    if (r.error) toast.error(r.error)
    else setExtracto(r.data!)
    setIsFetching(false)
  }

  return (
    <DashboardLayout userName="Usuario">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Extracto de cuenta</h1>
            <p className="text-muted-foreground">Consulta el estado de cuenta de un mes específico</p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Seleccionar período</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Cuenta</Label>
                <Select value={selectedCuenta} onValueChange={setSelectedCuenta} disabled={isLoading}>
                  <SelectTrigger className="bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cuentas.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.tipoCuenta} ****{c.numeroCuenta.slice(-4)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select value={mes} onValueChange={setMes}>
                  <SelectTrigger className="bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{MESES.map((m, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Año</Label>
                <Select value={anio} onValueChange={setAnio}>
                  <SelectTrigger className="bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{anios.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={buscar} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" disabled={isFetching}>
                  {isFetching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Buscando...</> : "Consultar extracto"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {extracto && (
          <div className="space-y-4">
            {/* Resumen */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">
                  Extracto {MESES[extracto.mes - 1]} {extracto.anio} — {extracto.tipoCuenta} {extracto.numeroCuentaEnmascarado}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{extracto.nombreTitular} · CC {extracto.documento}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Saldo inicial", value: extracto.saldoInicial, color: "text-foreground" },
                    { label: "Total créditos", value: extracto.totalCreditos, color: "text-success" },
                    { label: "Total débitos", value: extracto.totalDebitos, color: "text-destructive" },
                    { label: "Saldo final", value: extracto.saldoFinal, color: "text-primary" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border/50 bg-secondary px-4 py-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`mt-1 text-lg font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Movimientos */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-base">Movimientos del período</CardTitle></CardHeader>
              <CardContent className="p-0">
                {extracto.movimientos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Sin movimientos en este período</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extracto.movimientos.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell className="whitespace-nowrap text-sm">{formatDate(m.fecha)}</TableCell>
                            <TableCell className="text-sm">{m.concepto}</TableCell>
                            <TableCell className={`text-right text-sm font-semibold ${m.monto >= 0 ? "text-success" : "text-destructive"}`}>
                              {m.monto >= 0 ? "+" : ""}{formatCurrency(m.monto)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
