import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createUser, getUser } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUser(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await createUser(name, email, hashedPassword)

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret-key", {
      expiresIn: "7d",
    })

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 })
  }
}
