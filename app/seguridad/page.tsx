"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FormSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getDashboard, bloquearCuenta, desbloquearCuenta, type Cuenta } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { maskAccountNumber } from "@/lib/format"
import { toast } from "@/components/ui/sonner"
import { Shield, Lock, Unlock, Loader2, AlertTriangle, CheckCircle } from "lucide-react"

type ActionType = "bloquear" | "desbloquear" | null

export default function SeguridadPage() {
  const router = useRouter()
  const userName = useUserName()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentAction, setCurrentAction] = useState<ActionType>(null)
  const [password, setPassword] = useState("")

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

      if (result.data) {
        setCuentas(result.data)
      }

      setIsLoading(false)
    }

    loadCuentas()
  }, [router])

  const handleAction = (action: ActionType) => {
    setCurrentAction(action)
    setPassword("")
    setShowPasswordModal(true)
  }

  const handleConfirmAction = async () => {
    if (!password) {
      toast.error("Debes ingresar tu contraseña")
      return
    }

    setIsProcessing(true)

    let result
    if (currentAction === "bloquear") {
      result = await bloquearCuenta(password)
    } else {
      result = await desbloquearCuenta(password)
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        currentAction === "bloquear"
          ? "Cuenta bloqueada correctamente"
          : "Cuenta desbloqueada correctamente"
      )
      // Reload accounts to get updated status
      const updatedCuentas = await getDashboard()
      if (updatedCuentas.data) {
        setCuentas(updatedCuentas.data)
      }
    }

    setIsProcessing(false)
    setShowPasswordModal(false)
    setPassword("")
    setCurrentAction(null)
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Seguridad de cuenta</h1>
          <p className="text-muted-foreground">Gestiona la seguridad de tus cuentas bancarias</p>
        </div>

        {/* Account Status Cards */}
        <div className="space-y-4">
          {cuentas.map((cuenta) => (
            <Card key={cuenta.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Cuenta {maskAccountNumber(cuenta.numeroCuenta)}
                    </CardTitle>
                    <CardDescription>{cuenta.tipoCuenta}</CardDescription>
                  </div>
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                      cuenta.estado === "ACTIVA"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {cuenta.estado === "ACTIVA" ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        ACTIVA
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        BLOQUEADA
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {cuenta.estado === "ACTIVA" ? (
                    <Button
                      variant="destructive"
                      onClick={() => handleAction("bloquear")}
                      className="flex-1"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Bloquear mi cuenta
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => handleAction("desbloquear")}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Desbloquear mi cuenta
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {cuentas.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No tienes cuentas asociadas</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consejos de seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                Nunca compartas tu contraseña con nadie, incluyendo personal del banco.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                Si sospechas de actividad inusual, bloquea tu cuenta inmediatamente.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                Revisa periódicamente tus movimientos para detectar transacciones no autorizadas.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                Utiliza contraseñas seguras y cámbialas regularmente.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Password Confirmation Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentAction === "bloquear" ? "Bloquear cuenta" : "Desbloquear cuenta"}
            </DialogTitle>
            <DialogDescription>
              Por seguridad, ingresa tu contraseña para confirmar esta acción
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant={currentAction === "bloquear" ? "destructive" : "default"}
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={currentAction === "desbloquear" ? "bg-success hover:bg-success/90" : ""}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : currentAction === "bloquear" ? (
                "Confirmar bloqueo"
              ) : (
                "Confirmar desbloqueo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
