"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
  onClick?: () => void
}

export function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary/15 text-primary border-l-2 border-primary -ml-px pl-[11px]"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {label}
    </Link>
  )
}
