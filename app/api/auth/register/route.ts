import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { validateUser } from "@/lib/models"
import { cookies } from "next/headers"
import { logger, apiErrorResponse } from "@/lib/logger" // Import logger and helper

export async function POST(request: NextRequest) {
  let userData: any; // Define userData here to be accessible in catch block
  try {
    userData = await request.json()

    // Validate user data
    const validation = validateUser(userData)
    if (!validation.isValid) {
      const response = apiErrorResponse("Validation failed", 400, validation.errors)
      return NextResponse.json(response.json, { status: response.status })
    }

    // Create the user
    const user = await createUser(userData)

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
    const { password, passwordSalt, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to register user due to an unexpected error."
    // Log userData excluding password for security, if present
    const { password, ...loggableUserData } = userData || {};
    logger.error("User registration failed", error, loggableUserData)
    const response = apiErrorResponse(errorMessage, 500)
    return NextResponse.json(response.json, { status: response.status })
  }
}

