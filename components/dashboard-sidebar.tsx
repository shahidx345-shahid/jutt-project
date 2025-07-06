"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "./auth-provider"
import { LayoutDashboard, Package, Users, FileText, LogOut, Menu, X, Rocket, Star, Zap } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    description: "Manage your inventory",
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    description: "Customer management",
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    description: "Invoice generation",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-border/40 px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="relative">
            <Rocket className="h-8 w-8 text-cosmic-blue" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cosmic-purple animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-cosmic bg-clip-text text-transparent">Solar System</span>
            <span className="text-xs text-muted-foreground -mt-1">Invoice Generator</span>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-border/40">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-cosmic flex items-center justify-center">
            <span className="text-sm font-semibold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-cosmic text-white shadow-lg shadow-cosmic-purple/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-2 w-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isActive ? "text-white/80" : "text-muted-foreground/80"}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg bg-gradient-cosmic -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <Separator className="mx-3" />

      {/* Footer */}
      <div className="p-3 space-y-2">
        <div className="px-3 py-2 rounded-lg bg-gradient-nebula/10 border border-cosmic-purple/20">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-cosmic-purple" />
            <span className="text-xs font-medium text-cosmic-purple">Powered by AI</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Smart invoice generation with cosmic efficiency</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 md:hidden"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border shadow-xl"
          >
            {sidebarContent}
          </motion.div>
        </motion.div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-background border-r border-border">{sidebarContent}</div>
      </div>
    </>
  )
}
