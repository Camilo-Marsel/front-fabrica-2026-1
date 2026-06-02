"use client"

import { AppLayout } from "@/components/organisms/app-layout"

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
}

/** Wrapper de compatibilidad — delega al nuevo AppLayout */
export function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  return <AppLayout userName={userName}>{children}</AppLayout>
}
