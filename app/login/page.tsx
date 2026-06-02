"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/lib/api"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(formData.username, formData.password)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success("Inicio de sesión exitoso")
      router.push("/dashboard")
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* glow blobs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-60 w-60 rounded-full bg-accent/10 blur-[70px]" />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_0_28px_oklch(0.585_0.233_277/0.5)]">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Fábrica Escuela</h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Banco Digital</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Bienvenido de nuevo</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isLoading}
                  className="bg-secondary border-border/50 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  className="bg-secondary border-border/50 focus-visible:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent shadow-[0_4px_20px_oklch(0.585_0.233_277/0.4)] hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar →"
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                ¿Eres nuevo?{" "}
                <Link href="/registro/identidad" className="font-semibold text-primary hover:text-accent transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
