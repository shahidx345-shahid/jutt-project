import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DataProvider } from "@/components/data-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataProvider>
      <div className="min-h-screen">
        <DashboardSidebar />
        <div className="md:pl-64 pt-16 md:pt-0">{children}</div>
      </div>
    </DataProvider>
  )
}
