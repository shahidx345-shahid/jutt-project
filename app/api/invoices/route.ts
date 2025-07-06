import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getInvoices, createInvoice, createInvoiceItems } from "@/lib/db"

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

    const invoices = await getInvoices(user.userId)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Get invoices error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { invoice, items } = await request.json()

    // Create invoice
    const createdInvoice = await createInvoice(user.userId, invoice)

    // Create invoice items
    await createInvoiceItems(createdInvoice.id, items)

    return NextResponse.json(createdInvoice)
  } catch (error) {
    console.error("Create invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
