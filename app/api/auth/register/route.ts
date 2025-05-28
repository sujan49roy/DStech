import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { validateUser } from "@/lib/models"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate user data
    const validation = validateUser(userData)
    if (!validation.isValid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    // Create the user
    const user = await createUser(userData)

    // Set the user ID in a cookie
    const cookieStore = cookies()
    ;(await cookieStore).set("userId", user._id!.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return the user without the password
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register user" },
      { status: 500 },
    )
  }
}
