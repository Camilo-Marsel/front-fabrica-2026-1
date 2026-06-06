"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TransactionsSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getDashboard,
  getTransacciones,
  getTransaccionesFiltro,
  type Cuenta,
  type Transaccion,
} from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { formatCurrency, formatDate, maskAccountNumber, formatInputDate } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { Search } from "lucide-react"

export default function MovimientosPage() {
  const router = useRouter()
  const userName = useUserName()
  const [isLoading, setIsLoading] = useState(true)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState<string>("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  useEffect(() => {
    async function loadCuentas() {
      const result = await getDashboard()

      if (result.error) {
        if (result.status === 401) {
          router.push("/login")
          return
        }
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      if (result.data && result.data.length > 0) {
        setCuentas(result.data)
        setSelectedCuenta(result.data[0].id.toString())
        await loadTransacciones(result.data[0].id)
      }

      setIsLoading(false)
    }

    loadCuentas()
  }, [router])

  async function loadTransacciones(cuentaId: number) {
    const result = await getTransacciones(cuentaId)
    if (result.data) {
      setTransacciones(result.data)
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  async function handleCuentaChange(value: string) {
    setSelectedCuenta(value)
    setIsLoading(true)
    await loadTransacciones(parseInt(value))
    setIsLoading(false)
  }

  async function handleFilter() {
    if (!fechaInicio || !fechaFin) {
      toast.error("Debes seleccionar ambas fechas para filtrar")
      return
    }

    setIsLoading(true)
    const result = await getTransaccionesFiltro(
      parseInt(selectedCuenta),
      fechaInicio,
      fechaFin
    )

    if (result.data) {
      setTransacciones(result.data)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  async function handleClearFilter() {
    setFechaInicio("")
    setFechaFin("")
    if (selectedCuenta) {
      setIsLoading(true)
      await loadTransacciones(parseInt(selectedCuenta))
      setIsLoading(false)
    }
  }

  if (isLoading && cuentas.length === 0) {
    return (
      <DashboardLayout userName={userName}>
        <TransactionsSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimientos</h1>
          <p className="text-muted-foreground">Consulta el historial de transacciones de tus cuentas</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Cuenta</Label>
                <Select value={selectedCuenta} onValueChange={handleCuentaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuentas.map((cuenta) => (
                      <SelectItem key={cuenta.id} value={cuenta.id.toString()}>
                        {maskAccountNumber(cuenta.numeroCuenta)} - {cuenta.tipoCuenta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  max={formatInputDate(new Date())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  max={formatInputDate(new Date())}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleFilter} className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  Filtrar
                </Button>
                {(fechaInicio || fechaFin) && (
                  <Button variant="outline" onClick={handleClearFilter}>
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Cargando movimientos...</p>
              </div>
            ) : transacciones.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No hay movimientos para mostrar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha y hora</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transacciones.map((trans) => (
                      <TableRow key={trans.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(trans.fecha)}
                        </TableCell>
                        <TableCell>{trans.concepto}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              trans.tipo.toUpperCase() === "DEPOSITO"
                                ? "bg-success/10 text-success"
                                : trans.tipo.toUpperCase() === "RETIRO"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {trans.tipo}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            trans.monto >= 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {trans.monto >= 0 ? "+" : ""}
                          {formatCurrency(trans.monto)}
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
    </DashboardLayout>
  )
}
