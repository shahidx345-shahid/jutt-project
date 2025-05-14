"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
} | null

type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: "user_1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
  },
  {
    id: "user_2",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // In a real app, you would verify the session/token with your backend
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Protect routes
  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/", "/login", "/register", "/demo"]
      const isPublicRoute = publicRoutes.some((route) => pathname === route)

      if (!user && !isPublicRoute) {
        router.push("/login")
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, pathname, router])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Find user with matching email and password
      const foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

      if (!foundUser) {
        throw new Error("Invalid email or password")
      }

      const userToStore = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
      }

      localStorage.setItem("user", JSON.stringify(userToStore))
      setUser(userToStore)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      // Check if user with this email already exists
      const existingUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // In a real app, you would call your API to register
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
      }

      // Add to mock users (this won't persist on page refresh in this demo)
      MOCK_USERS.push({ ...newUser, password })

      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
