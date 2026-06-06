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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getDashboard, transferirInterbancario, confirmarAchDemo, rechazarAchDemo, type Cuenta, type SolicitudInterbancaria, type TransferenciaInterbancaria } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { Banknote, CheckCircle, Loader2, Zap, XCircle } from "lucide-react"

const BANCOS = ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogotá", "Banco Popular", "Nequi", "Daviplata"]
const TIPOS_CUENTA = ["AHORROS", "CORRIENTE"]
const TIPOS_DOC = ["CC", "CE", "NIT", "PASAPORTE"]

export default function TransferirInterbancarioPage() {
  const userName = useUserName()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [resultado, setResultado] = useState<TransferenciaInterbancaria | null>(null)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [form, setForm] = useState<Omit<SolicitudInterbancaria, "idCuentaOrigen"> & { idCuentaOrigen: string }>({
    idCuentaOrigen: "",
    bancoDestino: "",
    tipoCuentaDestino: "",
    numeroCuentaDestino: "",
    tipoDocumentoReceptor: "",
    numeroDocumentoReceptor: "",
    nombreReceptor: "",
    monto: 0,
  })

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    getDashboard().then((r) => {
      if (r.error) { if (r.status === 401) router.push("/login"); else toast.error(r.error!) }
      else if (r.data?.length) { setCuentas(r.data); set("idCuentaOrigen", r.data[0].id.toString()) }
      setIsLoading(false)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bancoDestino || !form.tipoCuentaDestino || !form.tipoDocumentoReceptor) {
      toast.error("Completa todos los campos"); return
    }
    setIsSubmitting(true)
    const result = await transferirInterbancario({
      ...form,
      idCuentaOrigen: parseInt(form.idCuentaOrigen),
    })
    if (result.error) toast.error(result.error)
    else setResultado(result.data!)
    setIsSubmitting(false)
  }

  const selectedCuenta = cuentas.find((c) => c.id.toString() === form.idCuentaOrigen)

  if (isLoading) return <DashboardLayout userName={userName}><FormSkeleton /></DashboardLayout>

  return (
    <DashboardLayout userName={userName}>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 shadow-[0_0_20px_oklch(0.585_0.233_277/0.3)]">
            <Banknote className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Transferencia interbancaria</h1>
          <p className="text-muted-foreground">Envía dinero a cuentas de otros bancos (ACH)</p>
        </div>

        <Card className="border-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Datos de la transferencia</CardTitle>
              <CardDescription>Completa la información del destinatario y el banco destino</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cuenta origen */}
              <div className="space-y-2">
                <Label>Cuenta origen</Label>
                <Select value={form.idCuentaOrigen} onValueChange={(v) => set("idCuentaOrigen", v)}>
                  <SelectTrigger className="bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cuentas.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{maskAccountNumber(c.numeroCuenta)} — {formatCurrency(c.saldo)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {selectedCuenta && <p className="text-xs text-muted-foreground">Saldo: <span className="font-semibold text-foreground">{formatCurrency(selectedCuenta.saldo)}</span></p>}
              </div>

              <div className="h-px bg-border/50" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banco destino</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select value={form.bancoDestino} onValueChange={(v) => set("bancoDestino", v)}>
                    <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{BANCOS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de cuenta</Label>
                  <Select value={form.tipoCuentaDestino} onValueChange={(v) => set("tipoCuentaDestino", v)}>
                    <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{TIPOS_CUENTA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCuentaDestino">Número de cuenta destino</Label>
                <Input id="numeroCuentaDestino" placeholder="Ej: 12345678901" className="bg-secondary border-border/50"
                  value={form.numeroCuentaDestino} onChange={(e) => set("numeroCuentaDestino", e.target.value)} required />
              </div>

              <div className="h-px bg-border/50" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destinatario</p>

              <div className="space-y-2">
                <Label htmlFor="nombreReceptor">Nombre completo</Label>
                <Input id="nombreReceptor" placeholder="Nombre del receptor" className="bg-secondary border-border/50"
                  value={form.nombreReceptor} onChange={(e) => set("nombreReceptor", e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo de documento</Label>
                  <Select value={form.tipoDocumentoReceptor} onValueChange={(v) => set("tipoDocumentoReceptor", v)}>
                    <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>{TIPOS_DOC.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroDoc">Número de documento</Label>
                  <Input id="numeroDoc" placeholder="1234567890" className="bg-secondary border-border/50"
                    value={form.numeroDocumentoReceptor} onChange={(e) => set("numeroDocumentoReceptor", e.target.value)} required />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-2">
                <Label htmlFor="monto">Monto (COP)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="monto" type="number" step="0.01" min="0.01" placeholder="0.00" className="pl-7 bg-secondary border-border/50"
                    value={form.monto || ""} onChange={(e) => set("monto", parseFloat(e.target.value))} required />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</> : "Enviar transferencia"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Dialog open={!!resultado} onOpenChange={() => setResultado(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="text-center">¡Transferencia enviada!</DialogTitle>
            <DialogDescription className="text-center">Tu transferencia interbancaria fue registrada</DialogDescription>
          </DialogHeader>
          {resultado && (
            <div className="rounded-xl border border-border/50 bg-secondary p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Referencia</span><span className="font-mono font-semibold">{resultado.referenciaExterna}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span className="font-bold">{formatCurrency(resultado.monto)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Saldo resultante</span><span className="font-semibold">{formatCurrency(resultado.saldoResultante)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span className="font-semibold text-warning">{resultado.estado}</span></div>
            </div>
          )}
          <div className="px-1 pb-1 space-y-2">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modo Demo — simular red ACH</p>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-success to-emerald-600 hover:opacity-90"
                disabled={isDemoLoading}
                onClick={async () => {
                  if (!resultado) return
                  setIsDemoLoading(true)
                  const r = await confirmarAchDemo(resultado.idTransaccion)
                  if (r.error) toast.error(r.error)
                  else { toast.success("ACH confirmado — transferencia exitosa"); setResultado(null); router.push("/dashboard") }
                  setIsDemoLoading(false)
                }}
              >
                {isDemoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="mr-1 h-4 w-4" />Confirmar ACH</>}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={isDemoLoading}
                onClick={async () => {
                  if (!resultado) return
                  setIsDemoLoading(true)
                  const r = await rechazarAchDemo(resultado.idTransaccion)
                  if (r.error) toast.error(r.error)
                  else { toast.error("ACH rechazado — saldo reversado"); setResultado(null) }
                  setIsDemoLoading(false)
                }}
              >
                <XCircle className="mr-1 h-4 w-4" />Rechazar ACH
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>Ir al dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
