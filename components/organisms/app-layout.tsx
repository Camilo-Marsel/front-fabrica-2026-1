"use client"

import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

interface AppLayoutProps {
  children: React.ReactNode
  userName: string
}

export function AppLayout({ children, userName }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64">
        <AppHeader userName={userName} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
