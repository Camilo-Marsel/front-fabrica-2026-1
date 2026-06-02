import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Receipt } from "lucide-react"
import { QuickActionBtn } from "@/components/molecules/quick-action-btn"

const ACTIONS = [
  { href: "/depositar",   label: "Depositar",  icon: ArrowDownCircle, variant: "success"     },
  { href: "/retirar",     label: "Retirar",    icon: ArrowUpCircle,   variant: "destructive" },
  { href: "/transferir",  label: "Transferir", icon: ArrowLeftRight,  variant: "accent"      },
  { href: "/movimientos", label: "Ver todo",   icon: Receipt,         variant: "muted"       },
] as const

export function QuickActionsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((a) => (
        <QuickActionBtn
          key={a.href}
          href={a.href}
          label={a.label}
          icon={a.icon}
          variant={a.variant}
        />
      ))}
    </div>
  )
}
