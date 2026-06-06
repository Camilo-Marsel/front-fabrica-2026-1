"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FormSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getPerfil, updatePerfil } from "@/lib/api"
import { useUserName } from "@/hooks/use-user-name"
import { toast } from "@/components/ui/sonner"
import { User, Loader2, Save } from "lucide-react"

interface PerfilData {
  nombre: string
  documento: string
  email: string
  telefono: string
}

export default function PerfilPage() {
  const router = useRouter()
  const userName = useUserName()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [perfil, setPerfil] = useState<PerfilData | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    telefono: "",
  })

  useEffect(() => {
    async function loadPerfil() {
      const result = await getPerfil()

      if (result.error) {
        if (result.status === 401) {
          router.push("/login")
          return
        }
        // If the endpoint doesn't exist yet, show placeholder
        setPerfil({
          nombre: "Usuario",
          documento: "********",
          email: "usuario@ejemplo.com",
          telefono: "3001234567",
        })
        setFormData({
          email: "usuario@ejemplo.com",
          telefono: "3001234567",
        })
        toast.error("El endpoint de perfil aún no está disponible")
        setIsLoading(false)
        return
      }

      if (result.data) {
        setPerfil(result.data)
        setFormData({
          email: result.data.email,
          telefono: result.data.telefono,
        })
      }

      setIsLoading(false)
    }

    loadPerfil()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const result = await updatePerfil(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Perfil actualizado correctamente")
      if (perfil) {
        setPerfil({ ...perfil, ...formData })
      }
    }

    setIsSaving(false)
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
            <User className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">Administra tu información personal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              Algunos datos no pueden ser modificados por seguridad
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Read-only fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={perfil?.nombre || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento de identidad</Label>
                  <Input
                    id="documento"
                    type="text"
                    value={perfil?.documento || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="3001234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
