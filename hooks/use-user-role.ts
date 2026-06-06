"use client"

import { useState, useEffect } from "react"
import { getMiRol } from "@/lib/api"

export function useUserRole(): string {
  const [role, setRole] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return sessionStorage.getItem("userRole") ?? ""
  })

  useEffect(() => {
    const cached = sessionStorage.getItem("userRole")
    if (cached) { setRole(cached); return }
    getMiRol().then((r) => {
      if (r.data?.rol) {
        sessionStorage.setItem("userRole", r.data.rol)
        setRole(r.data.rol)
      }
    })
  }, [])

  return role
}

export function esAdmin(role: string) {
  return role === "ADMIN" || role === "GERENTE"
}
