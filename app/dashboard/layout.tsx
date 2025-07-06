"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LoadingAnimation } from "@/components/loading-animation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingAnimation />
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="md:pl-64">
        <main className="pt-16 md:pt-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
