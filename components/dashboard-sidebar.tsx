"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, Package, Users, FileText, LogOut, Menu, X, Rocket } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
]

export function DashboardSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
            aria-label="Toggle mobile menu"
          >
            <div className={`transition-transform duration-200 ${isMobileMenuOpen ? "rotate-180" : ""}`}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </div>
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Solar Invoice
            </span>
          </div>

          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-[85%] max-w-sm bg-background border-r transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Solar Invoice
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Rocket className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Solar Invoice
            </span>
          </div>

          {/* User Info */}
          <div className="mt-8 px-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Avatar>
                <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
