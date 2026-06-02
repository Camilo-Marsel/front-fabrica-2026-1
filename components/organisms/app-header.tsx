"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppHeaderProps {
  userName: string
}

function getInitials(name: string): string {
  const words = name.trim().split(" ")
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

export function AppHeader({ userName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-6">
      <div className="lg:hidden w-10" />

      <div className="hidden lg:block">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Panel de control</p>
        <h2 className="text-base font-bold text-foreground leading-tight">Bienvenido de nuevo</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-muted-foreground sm:block">{userName}</span>
        <Avatar className="h-9 w-9 border-2 border-primary shadow-[0_0_10px_oklch(0.585_0.233_277/0.4)]">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
