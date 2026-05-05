"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  userName: string
}

function getInitials(name: string): string {
  const words = name.trim().split(" ")
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
      
      <h2 className="text-lg font-semibold text-card-foreground lg:text-xl">
        Bienvenido de nuevo
      </h2>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-muted-foreground sm:block">
          {userName}
        </span>
        <Avatar className="h-9 w-9 border-2 border-accent">
          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
