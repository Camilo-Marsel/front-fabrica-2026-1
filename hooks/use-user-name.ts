"use client"

import { useState, useEffect } from "react"
import { getPerfil } from "@/lib/api"

export function useUserName(): string {
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window === "undefined") return "Usuario"
    return sessionStorage.getItem("userName") ?? "Usuario"
  })

  useEffect(() => {
    const cached = sessionStorage.getItem("userName")
    if (cached) { setUserName(cached); return }
    getPerfil().then((result) => {
      if (result.data?.nombre) {
        sessionStorage.setItem("userName", result.data.nombre)
        setUserName(result.data.nombre)
      }
    })
  }, [])

  return userName
}
