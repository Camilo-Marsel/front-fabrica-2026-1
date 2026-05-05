"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FormSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getDashboard, retirar, type Cuenta } from "@/lib/api"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { ArrowUpCircle, CheckCircle, Loader2 } from "lucide-react"

export default function RetirarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState<string>("")
  const [monto, setMonto] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [nuevoSaldo, setNuevoSaldo] = useState(0)

  const selectedCuentaData = cuentas.find((c) => c.id.toString() === selectedCuenta)

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
      }

      setIsLoading(false)
    }

    loadCuentas()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum < 0.01) {
      toast.error("El monto debe ser mayor a $0.01")
      return
    }

    if (selectedCuentaData && montoNum > selectedCuentaData.saldo) {
      toast.error("Saldo insuficiente para realizar el retiro")
      return
    }

    setIsSubmitting(true)

    const result = await retirar(parseInt(selectedCuenta), montoNum)

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      setNuevoSaldo(result.data?.nuevoSaldo || 0)
      setShowSuccessModal(true)
      setMonto("")
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <DashboardLayout userName="Usuario">
        <FormSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName="Usuario">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ArrowUpCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Retirar</h1>
          <p className="text-muted-foreground">Retira fondos de tu cuenta</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Realizar retiro</CardTitle>
              <CardDescription>
                Selecciona la cuenta origen e ingresa el monto a retirar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cuenta origen</Label>
                <Select value={selectedCuenta} onValueChange={setSelectedCuenta}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuentas.map((cuenta) => (
                      <SelectItem key={cuenta.id} value={cuenta.id.toString()}>
                        {maskAccountNumber(cuenta.numeroCuenta)} - {formatCurrency(cuenta.saldo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCuentaData && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Saldo disponible</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(selectedCuentaData.saldo)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="monto">Monto a retirar</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedCuentaData?.saldo}
                    placeholder="0.00"
                    className="pl-7"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || !selectedCuenta}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Retirar"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <DialogTitle className="text-center">¡Retiro exitoso!</DialogTitle>
            <DialogDescription className="text-center">
              Tu retiro ha sido procesado correctamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Nuevo saldo</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(nuevoSaldo)}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseModal} className="w-full">
              Volver al Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
