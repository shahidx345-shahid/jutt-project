"use client"

import type React from "react"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="md:pl-64">
        <div className="pt-16 md:pt-0">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
