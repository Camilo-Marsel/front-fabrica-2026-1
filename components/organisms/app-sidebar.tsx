"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2, LayoutDashboard, Receipt, ArrowDownCircle, ArrowUpCircle,
  ArrowLeftRight, Banknote, Globe, FileText, CreditCard,
  User, Shield, LogOut, Menu, X,
} from "lucide-react"
import { NavItem } from "@/components/atoms/nav-item"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/api"
import { toast } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard",                label: "Dashboard",       icon: LayoutDashboard, group: "principal"   },
  { href: "/movimientos",              label: "Movimientos",     icon: Receipt,          group: "principal"   },
  { href: "/cuentas",                  label: "Mis cuentas",     icon: CreditCard,       group: "principal"   },
  { href: "/depositar",                label: "Depositar",       icon: ArrowDownCircle,  group: "operaciones" },
  { href: "/retirar",                  label: "Retirar",         icon: ArrowUpCircle,    group: "operaciones" },
  { href: "/transferir",               label: "Transferir",      icon: ArrowLeftRight,   group: "operaciones" },
  { href: "/transferir-interbancario", label: "Interbancaria",   icon: Banknote,         group: "operaciones" },
  { href: "/transferir-internacional", label: "Internacional",   icon: Globe,            group: "operaciones" },
  { href: "/extracto",                 label: "Extracto",        icon: FileText,         group: "informes"    },
  { href: "/perfil",                   label: "Perfil",          icon: User,             group: "cuenta"      },
  { href: "/seguridad",                label: "Seguridad",       icon: Shield,           group: "cuenta"      },
]

const GROUPS: { key: string; label: string }[] = [
  { key: "principal",   label: "Principal"   },
  { key: "operaciones", label: "Operaciones" },
  { key: "informes",    label: "Informes"    },
  { key: "cuenta",      label: "Mi cuenta"   },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    const result = await logout()
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Sesión cerrada correctamente")
      router.push("/login")
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          "border-r border-sidebar-border",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-[0_0_16px_oklch(0.585_0.233_277/0.5)]">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-sidebar-foreground">Fábrica Escuela</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">Banca Digital</p>
            </div>
          </div>

          {/* Nav agrupado */}
          <nav className="flex-1 px-3 py-3">
            {GROUPS.map((group) => {
              const items = NAV_ITEMS.filter((i) => i.group === group.key)
              return (
                <div key={group.key} className="mb-3">
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={pathname === item.href}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="shrink-0 border-t border-sidebar-border p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
