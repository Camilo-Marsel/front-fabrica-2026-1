"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registrar, type RegistroData } from "@/lib/api"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

export default function DatosPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [identidadData, setIdentidadData] = useState<{ documento: string; fechaExpedicion: string } | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    telefono: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const storedData = sessionStorage.getItem("registro_identidad")
    if (!storedData) {
      toast.error("Debes verificar tu identidad primero")
      router.push("/registro/identidad")
      return
    }
    setIdentidadData(JSON.parse(storedData))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!identidadData) {
      toast.error("Error: datos de identidad no encontrados")
      return
    }

    setIsLoading(true)

    const registroData: RegistroData = {
      documento: identidadData.documento,
      fechaExpedicion: identidadData.fechaExpedicion,
      nombre: formData.nombre,
      email: formData.email,
      direccion: formData.direccion,
      telefono: formData.telefono,
      username: formData.username,
      password: formData.password,
    }

    const result = await registrar(registroData)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      sessionStorage.removeItem("registro_identidad")
      setNumeroCuenta(result.data?.numeroCuenta || "")
      setShowSuccessModal(true)
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  if (!identidadData) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-10 w-10 text-accent" />
            <h1 className="text-2xl font-bold text-primary">Fábrica Escuela</h1>
          </div>
          <p className="text-muted-foreground">Tu banca digital de confianza</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-16 rounded-full bg-accent" />
          <div className="h-2 w-16 rounded-full bg-accent" />
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>
              Paso 2 de 2: Completa tu información personal para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Tu dirección"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Tu número de teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Elige un nombre de usuario"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear mi cuenta"
                )}
              </Button>
              <Link
                href="/registro/identidad"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al paso anterior
              </Link>
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
            <DialogTitle className="text-center">¡Cuenta creada exitosamente!</DialogTitle>
            <DialogDescription className="text-center">
              Tu cuenta bancaria ha sido creada. Guarda tu número de cuenta:
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center rounded-lg bg-muted p-4">
            <span className="text-2xl font-bold tracking-wider text-foreground">{numeroCuenta}</span>
          </div>
          <DialogFooter>
            <Button onClick={handleGoToLogin} className="w-full">
              Ir a iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
