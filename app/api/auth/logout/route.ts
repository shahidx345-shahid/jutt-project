import { NextResponse } from "next/server"

export async function POST() {
  try {
    // For JWT tokens, logout is handled client-side by removing the token
    // This endpoint exists for consistency and future server-side session management
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
