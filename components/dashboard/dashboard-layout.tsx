"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
}

export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header userName={userName} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
