"use client"

import type React from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAuth } from "@/components/auth-provider"
import { LoadingAnimation } from "@/components/loading-animation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, user } = useAuth()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation />
      </div>
    )
  }

  // Don't render dashboard if not authenticated (AuthProvider will handle redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="pt-16 md:pt-0">{children}</div>
      </main>
    </div>
  )
}
