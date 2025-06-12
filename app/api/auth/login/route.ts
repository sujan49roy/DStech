import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { logger, apiErrorResponse } from "@/lib/logger" // Import logger and helper

export async function POST(request: NextRequest) {
  let email: string | undefined; // Define email here to be accessible in catch block
  try {
    const body = await request.json()
    email = body.email; // Assign email
    const password = body.password;

    if (!email || !password) {
      const response = apiErrorResponse("Email and password are required", 400)
      return NextResponse.json(response.json, { status: response.status })
    }

    // Login the user
    const user = await loginUser(email, password)

    // Set the user ID in a cookie with enhanced security
    const cookieStore = cookies()
    ;(await cookieStore).set("userId", user._id!.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Prevent CSRF
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return the user without the password and passwordSalt
    const { password: _, passwordSalt: __, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to login due to an unexpected error."
    logger.error("Login failed", error, { email }) // Log with email context
    const response = apiErrorResponse(errorMessage, 401)
    return NextResponse.json(response.json, { status: response.status })
  }
}

