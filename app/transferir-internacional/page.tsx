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
import { getDashboard, transferirInternacional, type Cuenta, type SolicitudInternacional, type TransferenciaInternacional } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { Globe, CheckCircle, Loader2 } from "lucide-react"

const PAISES = ["Estados Unidos", "España", "México", "Argentina", "Chile", "Panamá", "Ecuador"]
const TIPOS_CUENTA = ["CHECKING", "SAVINGS", "CORRIENTE", "AHORROS"]
const TIPOS_DOC = ["CC", "CE", "PASSPORT", "NIT"]
const TASA_CAMBIO_DEFAULT = 4200

export default function TransferirInternacionalPage() {
  const userName = useUserName()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [resultado, setResultado] = useState<TransferenciaInternacional | null>(null)
  const [form, setForm] = useState<Omit<SolicitudInternacional, "idCuentaOrigen"> & { idCuentaOrigen: string }>({
    idCuentaOrigen: "",
    bancoDestino: "",
    codigoSwift: "",
    paisDestino: "",
    tipoCuentaDestino: "",
    ibanCuentaDestino: "",
    tipoDocumentoReceptor: "",
    numeroDocumentoReceptor: "",
    nombreReceptor: "",
    montoUsd: 0,
    tasaCambio: TASA_CAMBIO_DEFAULT,
    moneda: "USD",
  })

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))
  const montoCop = (form.montoUsd || 0) * (form.tasaCambio || TASA_CAMBIO_DEFAULT)

  useEffect(() => {
    getDashboard().then((r) => {
      if (r.error) { if (r.status === 401) router.push("/login"); else toast.error(r.error!) }
      else if (r.data?.length) { setCuentas(r.data); set("idCuentaOrigen", r.data[0].id.toString()) }
      setIsLoading(false)
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await transferirInternacional({ ...form, idCuentaOrigen: parseInt(form.idCuentaOrigen) })
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
            <Globe className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Transferencia internacional</h1>
          <p className="text-muted-foreground">Envía dinero al exterior vía SWIFT (en USD)</p>
        </div>

        <Card className="border-border/50">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Datos de la transferencia</CardTitle>
              <CardDescription>El monto se ingresa en USD y se debita en COP a la tasa de cambio indicada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cuenta origen</Label>
                <Select value={form.idCuentaOrigen} onValueChange={(v) => set("idCuentaOrigen", v)}>
                  <SelectTrigger className="bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cuentas.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{maskAccountNumber(c.numeroCuenta)} — {formatCurrency(c.saldo)}</SelectItem>)}
                  </SelectContent>
                </Select>
                {selectedCuenta && <p className="text-xs text-muted-foreground">Saldo disponible: <span className="font-semibold text-foreground">{formatCurrency(selectedCuenta.saldo)}</span></p>}
              </div>

              <div className="h-px bg-border/50" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banco destino</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>País destino</Label>
                  <Select value={form.paisDestino} onValueChange={(v) => set("paisDestino", v)}>
                    <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="País" /></SelectTrigger>
                    <SelectContent>{PAISES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de cuenta</Label>
                  <Select value={form.tipoCuentaDestino} onValueChange={(v) => set("tipoCuentaDestino", v)}>
                    <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>{TIPOS_CUENTA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bancoDestino">Banco destino</Label>
                <Input id="bancoDestino" placeholder="Ej: Bank of America" className="bg-secondary border-border/50"
                  value={form.bancoDestino} onChange={(e) => set("bancoDestino", e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="swift">Código SWIFT / BIC</Label>
                  <Input id="swift" placeholder="BOFAUS3N" className="bg-secondary border-border/50 uppercase"
                    value={form.codigoSwift} onChange={(e) => set("codigoSwift", e.target.value.toUpperCase())} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN / Nro. cuenta</Label>
                  <Input id="iban" placeholder="US12345678901" className="bg-secondary border-border/50"
                    value={form.ibanCuentaDestino} onChange={(e) => set("ibanCuentaDestino", e.target.value)} required />
                </div>
              </div>

              <div className="h-px bg-border/50" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destinatario</p>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" placeholder="Nombre del receptor" className="bg-secondary border-border/50"
                  value={form.nombreReceptor} onChange={(e) => set("nombreReceptor", e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo documento</Label>
                  <Select value={form.tipoDocumentoReceptor} onValueChange={(v) => set("tipoDocumentoReceptor", v)}>
                    <SelectTrigger className="bg-secondary border-border/50"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>{TIPOS_DOC.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numDoc">Número documento</Label>
                  <Input id="numDoc" placeholder="Número" className="bg-secondary border-border/50"
                    value={form.numeroDocumentoReceptor} onChange={(e) => set("numeroDocumentoReceptor", e.target.value)} required />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="montoUsd">Monto (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input id="montoUsd" type="number" step="0.01" min="0.01" placeholder="0.00" className="pl-7 bg-secondary border-border/50"
                      value={form.montoUsd || ""} onChange={(e) => set("montoUsd", parseFloat(e.target.value))} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tasa">Tasa de cambio (COP/USD)</Label>
                  <Input id="tasa" type="number" step="1" min="1" className="bg-secondary border-border/50"
                    value={form.tasaCambio} onChange={(e) => set("tasaCambio", parseFloat(e.target.value))} required />
                </div>
              </div>

              {form.montoUsd > 0 && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total a debitar en COP</span>
                  <span className="font-bold text-primary">{formatCurrency(montoCop)}</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-accent to-violet-600 hover:opacity-90" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</> : "Enviar transferencia SWIFT"}
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
            <DialogDescription className="text-center">Tu transferencia SWIFT fue registrada correctamente</DialogDescription>
          </DialogHeader>
          {resultado && (
            <div className="rounded-xl border border-border/50 bg-secondary p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Referencia SWIFT</span><span className="font-mono font-semibold">{resultado.referenciaSwift}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monto USD</span><span className="font-bold">USD {resultado.montoUsd}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monto COP debitado</span><span className="font-semibold">{formatCurrency(resultado.montoCop)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span className="font-semibold text-warning">{resultado.estado}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>Ir al dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
