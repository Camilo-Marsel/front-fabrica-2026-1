"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Receipt } from "lucide-react"

const actions = [
  {
    href: "/depositar",
    label: "Depositar",
    icon: ArrowDownCircle,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    href: "/retirar",
    label: "Retirar",
    icon: ArrowUpCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    href: "/transferir",
    label: "Transferir",
    icon: ArrowLeftRight,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    href: "/movimientos",
    label: "Ver todo",
    icon: Receipt,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="flex flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-muted/50">
            <div className={`rounded-full p-3 ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Card>
        </Link>
      ))}
    </div>
  )
}
