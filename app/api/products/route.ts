import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getProducts, createProduct } from "@/lib/db"

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

    const products = await getProducts(user.userId)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productData = await request.json()

    // Validate required fields
    if (
      !productData.name ||
      !productData.sku ||
      !productData.category ||
      productData.price === undefined ||
      productData.stock === undefined
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate data types
    if (typeof productData.price !== "number" || productData.price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    if (typeof productData.stock !== "number" || productData.stock < 0) {
      return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 })
    }

    const product = await createProduct(user.userId, productData)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)

    // Handle specific database errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
