"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

type User = {
  id: number
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        // Check localStorage for token
        const token = localStorage.getItem("auth_token")
        const userData = localStorage.getItem("user_data")

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            if (parsedUser && parsedUser.id && parsedUser.email) {
              setUser(parsedUser)
            } else {
              // Invalid user data, clear storage
              localStorage.removeItem("auth_token")
              localStorage.removeItem("user_data")
            }
          } catch (error) {
            console.error("Error parsing user data:", error)
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [mounted])

  // Handle route protection
  useEffect(() => {
    if (!mounted || loading) return

    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/"
    const isDashboardPage = pathname?.startsWith("/dashboard")

    if (!user && isDashboardPage) {
      // User not authenticated, redirect to login
      router.push("/login")
    } else if (user && isAuthPage && pathname !== "/") {
      // User authenticated but on auth page, redirect to dashboard
      router.push("/dashboard")
    }
  }, [user, pathname, router, loading, mounted])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)

        // Store auth data safely
        try {
          localStorage.setItem("auth_token", data.token || "authenticated")
          localStorage.setItem("user_data", JSON.stringify(data.user))
        } catch (error) {
          console.error("Error storing auth data:", error)
        }

        return true
      } else {
        console.error("Login failed:", data.error)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)

        // Store auth data safely
        try {
          localStorage.setItem("auth_token", data.token || "authenticated")
          localStorage.setItem("user_data", JSON.stringify(data.user))
        } catch (error) {
          console.error("Error storing auth data:", error)
        }

        return true
      } else {
        console.error("Registration failed:", data.error)
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)

    // Clear auth data safely
    try {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
    } catch (error) {
      console.error("Error clearing auth data:", error)
    }

    router.push("/login")
  }

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
