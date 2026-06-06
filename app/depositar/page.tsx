"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FormSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDashboard, registrarDepositoPendiente, confirmarDepositoDemo, type Cuenta, type DepositoPendiente } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { ArrowDownCircle, Clock, Copy, Loader2, Zap } from "lucide-react"

export default function DepositarPage() {
  const router = useRouter()
  const userName = useUserName()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState("")
  const [monto, setMonto] = useState("")
  const [resultado, setResultado] = useState<DepositoPendiente | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const selectedCuentaData = cuentas.find((c) => c.id.toString() === selectedCuenta)

  useEffect(() => {
    getDashboard().then((r) => {
      if (r.error) {
        if (r.status === 401) { router.push("/login"); return }
        toast.error(r.error)
      } else if (r.data?.length) {
        setCuentas(r.data)
        setSelectedCuenta(r.data[0].id.toString())
      }
      setIsLoading(false)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum < 0.01) {
      toast.error("El monto debe ser mayor a $0.01")
      return
    }
    setIsSubmitting(true)
    const result = await registrarDepositoPendiente(
      selectedCuentaData!.numeroCuenta,
      montoNum
    )
    if (result.error) {
      toast.error(result.error)
    } else {
      setResultado(result.data!)
    }
    setIsSubmitting(false)
  }

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto)
    toast.success("Referencia copiada")
  }

  const handleConfirmarDemo = async () => {
    if (!resultado || !selectedCuentaData) return
    setIsConfirming(true)
    const r = await confirmarDepositoDemo(
      selectedCuentaData.numeroCuenta,
      parseFloat(monto),
      resultado.referenciaGateway
    )
    if (r.error) toast.error(r.error)
    else { toast.success("Depósito acreditado — modo demo"); setResultado(null); setMonto("") }
    setIsConfirming(false)
  }

  if (isLoading) return <DashboardLayout userName={userName}><FormSkeleton /></DashboardLayout>

  return (
    <DashboardLayout userName={userName}>
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 shadow-[0_0_20px_oklch(0.70_0.17_162/0.3)]">
            <ArrowDownCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Depositar</h1>
          <p className="text-muted-foreground">Agrega fondos a tu cuenta</p>
        </div>

        {!resultado ? (
          <Card className="border-border/50">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Registrar depósito</CardTitle>
                <CardDescription>
                  Se generará una referencia de depósito que debes presentar en ventanilla o pasarela de pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cuenta destino</Label>
                  <Select value={selectedCuenta} onValueChange={setSelectedCuenta}>
                    <SelectTrigger className="bg-secondary border-border/50">
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuentas.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {maskAccountNumber(c.numeroCuenta)} — {formatCurrency(c.saldo)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto a depositar (COP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="pl-7 bg-secondary border-border/50"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-success to-emerald-600 hover:opacity-90"
                  disabled={isSubmitting || !selectedCuenta}
                >
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</> : "Generar referencia de depósito"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="border-success/30 bg-success/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-success">Depósito registrado</CardTitle>
                  <CardDescription>Presenta esta referencia para completar el depósito</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-success/20 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Referencia</span>
                  <button onClick={() => copiar(resultado.referenciaGateway)} className="text-primary hover:text-accent">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="font-mono text-lg font-bold text-foreground break-all">{resultado.referenciaGateway}</p>
                <div className="h-px bg-border/50" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <p className="font-semibold text-foreground">{resultado.estado}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tiempo restante</p>
                    <p className="font-semibold text-foreground">{Math.floor(resultado.segundosRestantes / 60)} min</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                El depósito se acreditará automáticamente una vez confirmado por la pasarela
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full bg-gradient-to-r from-success to-emerald-600 hover:opacity-90"
                onClick={handleConfirmarDemo}
                disabled={isConfirming}
              >
                {isConfirming
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirmando...</>
                  : <><Zap className="mr-2 h-4 w-4" />Confirmar depósito (Demo)</>}
              </Button>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setResultado(null)}>
                  Nuevo depósito
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                  Dashboard
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
