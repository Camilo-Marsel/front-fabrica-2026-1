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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getDashboard, transferir, type Cuenta } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { formatCurrency, maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { ArrowLeftRight, CheckCircle, Loader2 } from "lucide-react"

export default function TransferirPage() {
  const router = useRouter()
  const userName = useUserName()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState<string>("")
  const [cuentaDestino, setCuentaDestino] = useState("")
  const [monto, setMonto] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum < 0.01) {
      toast.error("El monto debe ser mayor a $0.01")
      return
    }

    if (selectedCuentaData && montoNum > selectedCuentaData.saldo) {
      toast.error("Saldo insuficiente para realizar la transferencia")
      return
    }

    if (cuentaDestino.length !== 8) {
      toast.error("El número de cuenta destino debe tener 8 dígitos")
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmTransfer = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)

    const result = await transferir(parseInt(selectedCuenta), cuentaDestino, parseFloat(monto))

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      setNuevoSaldo(result.data?.nuevoSaldo || 0)
      setShowSuccessModal(true)
      setMonto("")
      setCuentaDestino("")
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <DashboardLayout userName={userName}>
        <FormSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <ArrowLeftRight className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Transferir</h1>
          <p className="text-muted-foreground">Envía dinero a otra cuenta</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Realizar transferencia</CardTitle>
              <CardDescription>
                Ingresa los datos de la transferencia
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
                <Label htmlFor="cuentaDestino">Número de cuenta destino</Label>
                <Input
                  id="cuentaDestino"
                  type="text"
                  placeholder="12345678"
                  maxLength={8}
                  value={cuentaDestino}
                  onChange={(e) => setCuentaDestino(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Ingresa los 8 dígitos del número de cuenta</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monto">Monto a transferir</Label>
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
                  "Transferir"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar transferencia</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas realizar esta transferencia?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cuenta destino:</span>
              <span className="font-medium">{cuentaDestino}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto:</span>
              <span className="font-bold text-foreground">{formatCurrency(parseFloat(monto) || 0)}</span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTransfer}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <DialogTitle className="text-center">¡Transferencia exitosa!</DialogTitle>
            <DialogDescription className="text-center">
              Tu transferencia ha sido procesada correctamente
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
