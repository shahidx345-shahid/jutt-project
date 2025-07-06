import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getCustomers, createCustomer } from "@/lib/db"

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customers = await getCustomers(user.userId)
    return NextResponse.json(customers)
  } catch (error) {
    console.error("Get customers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customerData = await request.json()

    // Validate required fields
    if (!customerData.name || !customerData.email || !customerData.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const customer = await createCustomer(user.userId, customerData)
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Create customer error:", error)

    // Handle specific database errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "Customer with this email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
