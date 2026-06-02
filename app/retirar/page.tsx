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
import { getDashboard, generarTokenRetiro, type Cuenta, type TokenRetiro } from "@/lib/api"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { ArrowUpCircle, Copy, Loader2, ShieldCheck } from "lucide-react"

export default function RetirarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState("")
  const [monto, setMonto] = useState("")
  const [token, setToken] = useState<TokenRetiro | null>(null)
  const [segundos, setSegundos] = useState(0)

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

  // countdown timer
  useEffect(() => {
    if (!token || segundos <= 0) return
    const id = setInterval(() => setSegundos((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [token, segundos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum < 0.01) { toast.error("El monto debe ser mayor a $0.01"); return }
    if (selectedCuentaData && montoNum > selectedCuentaData.saldo) { toast.error("Saldo insuficiente"); return }
    setIsSubmitting(true)
    const result = await generarTokenRetiro(parseInt(selectedCuenta), montoNum)
    if (result.error) {
      toast.error(result.error)
    } else {
      setToken(result.data!)
      setSegundos(result.data!.segundosRestantes)
    }
    setIsSubmitting(false)
  }

  const copiar = () => {
    if (token) { navigator.clipboard.writeText(token.codigo); toast.success("Código copiado") }
  }

  const minutos = Math.floor(segundos / 60)
  const segs = segundos % 60
  const expirado = segundos <= 0

  if (isLoading) return <DashboardLayout userName="Usuario"><FormSkeleton /></DashboardLayout>

  return (
    <DashboardLayout userName="Usuario">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/15">
            <ArrowUpCircle className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Retirar</h1>
          <p className="text-muted-foreground">Genera un token OTP para retirar en cajero o ventanilla</p>
        </div>

        {!token ? (
          <Card className="border-border/50">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Generar token de retiro</CardTitle>
                <CardDescription>
                  Se generará un código único válido por tiempo limitado para usar en cajero o ventanilla
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cuenta origen</Label>
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
                {selectedCuentaData && (
                  <div className="rounded-lg bg-secondary px-4 py-3">
                    <p className="text-xs text-muted-foreground">Saldo disponible</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedCuentaData.saldo)}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto a retirar (COP)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedCuentaData?.saldo}
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
                  className="w-full bg-gradient-to-r from-warning to-amber-600 text-warning-foreground hover:opacity-90"
                  disabled={isSubmitting || !selectedCuenta}
                >
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</> : "Generar token OTP"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className={`border-2 ${expirado ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${expirado ? "bg-destructive/15" : "bg-warning/15"}`}>
                  <ShieldCheck className={`h-5 w-5 ${expirado ? "text-destructive" : "text-warning"}`} />
                </div>
                <div>
                  <CardTitle className={expirado ? "text-destructive" : "text-warning"}>
                    {expirado ? "Token expirado" : "Token activo"}
                  </CardTitle>
                  <CardDescription>
                    {expirado ? "Genera un nuevo token para continuar" : "Presenta este código en cajero o ventanilla"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-xl border p-5 text-center space-y-3 ${expirado ? "border-destructive/20 bg-card" : "border-warning/20 bg-card"}`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Código OTP</p>
                <div className="flex items-center justify-center gap-3">
                  <p className={`font-mono text-4xl font-black tracking-widest ${expirado ? "text-destructive/50 line-through" : "text-foreground"}`}>
                    {token.codigo}
                  </p>
                  {!expirado && (
                    <button onClick={copiar} className="text-muted-foreground hover:text-primary transition-colors">
                      <Copy className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="h-px bg-border/50" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monto</p>
                    <p className="font-bold text-foreground">{formatCurrency(token.monto)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tiempo restante</p>
                    <p className={`font-bold tabular-nums ${segundos < 60 ? "text-destructive" : "text-foreground"}`}>
                      {expirado ? "Expirado" : `${minutos}:${String(segs).padStart(2, "0")}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setToken(null); setMonto("") }}>
                {expirado ? "Intentar de nuevo" : "Cancelar"}
              </Button>
              <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                Ir al dashboard
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
