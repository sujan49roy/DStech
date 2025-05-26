import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Login the user
    const user = await loginUser(email, password)

    // Set the user ID in a cookie
    const cookieStore = cookies()
    cookieStore.set("userId", user._id!.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to login" }, { status: 401 })
  }
}
