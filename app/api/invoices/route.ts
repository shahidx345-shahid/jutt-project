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

    const body = await request.json()
    console.log("Received invoice data:", body)

    const { invoice, items } = body

    // Validate required fields
    if (!invoice || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    if (!invoice.customer_id || !invoice.issue_date || !invoice.total_amount) {
      return NextResponse.json({ error: "Missing required invoice fields" }, { status: 400 })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Invoice must have at least one item" }, { status: 400 })
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price || !item.total_price) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 })
      }
    }

    console.log("Creating invoice with data:", invoice)

    // Create invoice
    const createdInvoice = await createInvoice(user.userId, invoice)
    console.log("Created invoice:", createdInvoice)

    if (!createdInvoice || !createdInvoice.id) {
      throw new Error("Failed to create invoice - no ID returned")
    }

    // Create invoice items
    console.log("Creating invoice items for invoice ID:", createdInvoice.id)
    await createInvoiceItems(createdInvoice.id, items)

    return NextResponse.json(createdInvoice)
  } catch (error) {
    console.error("Create invoice error:", error)
    return NextResponse.json(
      {
        error: "Failed to create invoice",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
