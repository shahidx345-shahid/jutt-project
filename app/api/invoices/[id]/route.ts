import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getInvoiceWithItems, deleteInvoice } from "@/lib/db"

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoice = await getInvoiceWithItems(Number.parseInt(params.id), user.userId)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Get invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await deleteInvoice(Number.parseInt(params.id), user.userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
