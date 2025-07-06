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

    // Validate required fields
    if (!body.customer_id || !body.issue_date || !body.total_amount) {
      return NextResponse.json({ error: "Missing required invoice fields" }, { status: 400 })
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Invoice must have at least one item" }, { status: 400 })
    }

    // Validate items
    for (const item of body.items) {
      if (!item.product_id || !item.quantity || item.unit_price === undefined || item.total_price === undefined) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 })
      }
    }

    // Prepare invoice data
    const invoiceData = {
      customer_id: Number(body.customer_id),
      issue_date: body.issue_date,
      due_date: body.due_date,
      subtotal: Number(body.subtotal),
      tax_rate: Number(body.tax_rate || 10),
      tax_amount: Number(body.tax_amount),
      total_amount: Number(body.total_amount),
      status: body.status || "pending",
      notes: body.notes || "",
    }

    console.log("Creating invoice with data:", invoiceData)

    // Create invoice
    const createdInvoice = await createInvoice(user.userId, invoiceData)
    console.log("Created invoice:", createdInvoice)

    if (!createdInvoice || !createdInvoice.id) {
      throw new Error("Failed to create invoice - no ID returned")
    }

    // Create invoice items
    console.log("Creating invoice items for invoice ID:", createdInvoice.id)
    const itemsData = body.items.map((item: any) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
    }))

    await createInvoiceItems(createdInvoice.id, itemsData)

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
