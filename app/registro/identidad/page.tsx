"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { validarIdentidad } from "@/lib/api"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, ArrowLeft } from "lucide-react"

export default function IdentidadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    documento: "",
    fechaExpedicion: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await validarIdentidad(formData.documento, formData.fechaExpedicion)

    if (result.error) {
      if (result.status === 400) {
        toast.error("Documento ya registrado")
      } else {
        toast.error(result.error)
      }
      setIsLoading(false)
    } else {
      // Store data in sessionStorage for the next step
      sessionStorage.setItem("registro_identidad", JSON.stringify(formData))
      toast.success("Identidad verificada correctamente")
      router.push("/registro/datos")
    }
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
          <div className="h-2 w-16 rounded-full bg-muted" />
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Verificar identidad</CardTitle>
            <CardDescription>
              Paso 1 de 2: Ingresa tu documento de identidad para verificar tu elegibilidad
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documento">Número de documento</Label>
                <Input
                  id="documento"
                  type="text"
                  placeholder="Ingresa tu número de documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaExpedicion">Fecha de expedición</Label>
                <Input
                  id="fechaExpedicion"
                  type="date"
                  value={formData.fechaExpedicion}
                  onChange={(e) => setFormData({ ...formData, fechaExpedicion: e.target.value })}
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
                    Verificando...
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
