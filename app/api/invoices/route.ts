import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getInvoices, createInvoice, createInvoiceItems } from "@/lib/db"

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
  } catch (error) {
    console.error("Token verification error:", error)
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
      console.error("No user token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Authenticated user:", user)

    const body = await request.json()
    console.log("Received invoice data:", JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.customer_id) {
      console.error("Missing customer_id")
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    if (!body.issue_date) {
      console.error("Missing issue_date")
      return NextResponse.json({ error: "Issue date is required" }, { status: 400 })
    }

    if (body.total_amount === undefined || body.total_amount === null) {
      console.error("Missing total_amount")
      return NextResponse.json({ error: "Total amount is required" }, { status: 400 })
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.error("Missing or empty items array")
      return NextResponse.json({ error: "Invoice must have at least one item" }, { status: 400 })
    }

    // Validate items
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i]
      if (!item.product_id) {
        console.error(`Item ${i}: Missing product_id`)
        return NextResponse.json({ error: `Item ${i + 1}: Product ID is required` }, { status: 400 })
      }
      if (!item.quantity || item.quantity <= 0) {
        console.error(`Item ${i}: Invalid quantity`)
        return NextResponse.json({ error: `Item ${i + 1}: Valid quantity is required` }, { status: 400 })
      }
      if (item.unit_price === undefined || item.unit_price < 0) {
        console.error(`Item ${i}: Invalid unit_price`)
        return NextResponse.json({ error: `Item ${i + 1}: Valid unit price is required` }, { status: 400 })
      }
      if (item.total_price === undefined || item.total_price < 0) {
        console.error(`Item ${i}: Invalid total_price`)
        return NextResponse.json({ error: `Item ${i + 1}: Valid total price is required` }, { status: 400 })
      }
    }

    // Prepare invoice data with safe number conversion
    const invoiceData = {
      customer_id: Number.parseInt(String(body.customer_id), 10),
      issue_date: body.issue_date,
      due_date: body.due_date || body.issue_date,
      subtotal: Number.parseFloat(String(body.subtotal || 0)),
      tax_rate: Number.parseFloat(String(body.tax_rate || 10)),
      tax_amount: Number.parseFloat(String(body.tax_amount || 0)),
      total_amount: Number.parseFloat(String(body.total_amount)),
      status: body.status || "pending",
      notes: body.notes || "",
    }

    console.log("Processed invoice data:", JSON.stringify(invoiceData, null, 2))

    // Validate processed data
    if (isNaN(invoiceData.customer_id)) {
      console.error("Invalid customer_id after parsing")
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 })
    }

    if (isNaN(invoiceData.total_amount)) {
      console.error("Invalid total_amount after parsing")
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 })
    }

    // Create invoice
    console.log("Creating invoice...")
    const createdInvoice = await createInvoice(user.userId, invoiceData)
    console.log("Created invoice:", createdInvoice)

    if (!createdInvoice || !createdInvoice.id) {
      console.error("Failed to create invoice - no ID returned")
      throw new Error("Failed to create invoice - no ID returned")
    }

    // Prepare items data
    const itemsData = body.items.map((item: any, index: number) => {
      const processedItem = {
        product_id: Number.parseInt(String(item.product_id), 10),
        quantity: Number.parseInt(String(item.quantity), 10),
        unit_price: Number.parseFloat(String(item.unit_price)),
        total_price: Number.parseFloat(String(item.total_price)),
      }

      // Validate processed item
      if (isNaN(processedItem.product_id)) {
        throw new Error(`Item ${index + 1}: Invalid product ID`)
      }
      if (isNaN(processedItem.quantity) || processedItem.quantity <= 0) {
        throw new Error(`Item ${index + 1}: Invalid quantity`)
      }
      if (isNaN(processedItem.unit_price) || processedItem.unit_price < 0) {
        throw new Error(`Item ${index + 1}: Invalid unit price`)
      }
      if (isNaN(processedItem.total_price) || processedItem.total_price < 0) {
        throw new Error(`Item ${index + 1}: Invalid total price`)
      }

      return processedItem
    })

    console.log("Processed items data:", JSON.stringify(itemsData, null, 2))

    // Create invoice items
    console.log("Creating invoice items for invoice ID:", createdInvoice.id)
    await createInvoiceItems(createdInvoice.id, itemsData)

    console.log("Invoice and items created successfully")
    return NextResponse.json(createdInvoice)
  } catch (error) {
    console.error("Create invoice error:", error)

    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("Error stack:", errorStack)

    return NextResponse.json(
      {
        error: "Failed to create invoice",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
