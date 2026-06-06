"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BalanceCard } from "@/components/organisms/balance-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { getDashboard, abrirCuenta, cerrarCuenta, type Cuenta } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { formatCurrency } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { CreditCard, PlusCircle, XCircle, Loader2, Eye, EyeOff, Copy } from "lucide-react"

export default function CuentasPage() {
  const router = useRouter()
  const userName = useUserName()
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tipoCuenta, setTipoCuenta] = useState<"AHORROS" | "CORRIENTE">("AHORROS")
  const [cuentaACerrar, setCuentaACerrar] = useState<Cuenta | null>(null)
  const [contrasena, setContrasena] = useState("")
  const [numerosVisibles, setNumerosVisibles] = useState<Set<number>>(new Set())

  const cargarCuentas = async () => {
    const r = await getDashboard()
    if (r.error) { if (r.status === 401) router.push("/login"); return }
    setCuentas(r.data ?? [])
  }

  useEffect(() => {
    cargarCuentas().then(() => setIsLoading(false))
  }, [router])

  const handleAbrir = async () => {
    setIsSubmitting(true)
    const r = await abrirCuenta(tipoCuenta)
    if (r.error) toast.error(r.error)
    else { toast.success("Cuenta abierta exitosamente"); await cargarCuentas() }
    setIsSubmitting(false)
  }

  const handleCerrar = async () => {
    if (!cuentaACerrar || !contrasena) return
    setIsSubmitting(true)
    const r = await cerrarCuenta(cuentaACerrar.id, contrasena)
    if (r.error) toast.error(r.error)
    else { toast.success("Cuenta cerrada correctamente"); setCuentaACerrar(null); setContrasena(""); await cargarCuentas() }
    setIsSubmitting(false)
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis cuentas</h1>
            <p className="text-muted-foreground">Administra tus cuentas bancarias</p>
          </div>
        </div>

        {/* Cuentas existentes */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : cuentas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cuentas.map((c) => (
              <div key={c.id} className="space-y-2">
                <BalanceCard cuenta={c} />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border/50 text-xs"
                    onClick={() => {
                      setNumerosVisibles((prev) => {
                        const next = new Set(prev)
                        next.has(c.id) ? next.delete(c.id) : next.add(c.id)
                        return next
                      })
                    }}
                  >
                    {numerosVisibles.has(c.id) ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                    {numerosVisibles.has(c.id) ? "Ocultar" : "Ver número"}
                  </Button>
                  {numerosVisibles.has(c.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/50 text-xs"
                      onClick={() => { navigator.clipboard.writeText(c.numeroCuenta); toast.success("Número copiado") }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {numerosVisibles.has(c.id) && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-center font-mono text-sm font-medium tracking-widest">
                    {c.numeroCuenta}
                  </p>
                )}
                {c.estado === "ACTIVA" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setCuentaACerrar(c)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cerrar cuenta
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <p className="text-muted-foreground">No tienes cuentas asociadas</p>
          </div>
        )}

        {/* Abrir nueva cuenta */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15">
                <PlusCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-base">Abrir nueva cuenta</CardTitle>
                <CardDescription>Agrega una cuenta adicional a tu perfil</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs space-y-2">
              <Label>Tipo de cuenta</Label>
              <Select value={tipoCuenta} onValueChange={(v) => setTipoCuenta(v as "AHORROS" | "CORRIENTE")}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AHORROS">💰 Cuenta de Ahorros</SelectItem>
                  <SelectItem value="CORRIENTE">🏦 Cuenta Corriente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAbrir}
              className="bg-gradient-to-r from-success to-emerald-600 hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Abriendo...</> : <><PlusCircle className="mr-2 h-4 w-4" />Abrir cuenta</>}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modal cierre de cuenta */}
      <AlertDialog open={!!cuentaACerrar} onOpenChange={(o) => { if (!o) { setCuentaACerrar(null); setContrasena("") } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. La cuenta debe tener saldo en cero para poder cerrarla.
              {cuentaACerrar && (
                <span className="mt-2 block rounded-lg bg-muted p-3 text-sm font-medium text-foreground">
                  {cuentaACerrar.tipoCuenta} — Saldo: {formatCurrency(cuentaACerrar.saldo)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="pwd">Confirma con tu contraseña</Label>
            <Input
              id="pwd"
              type="password"
              placeholder="Tu contraseña"
              className="bg-secondary border-border/50"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCerrar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting || !contrasena}
            >
              {isSubmitting ? "Cerrando..." : "Confirmar cierre"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
