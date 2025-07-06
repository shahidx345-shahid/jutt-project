import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUser } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any

    const user = await getUser(decoded.email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
