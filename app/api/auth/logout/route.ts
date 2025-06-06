import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies();
    (await cookieStore).delete("userId");

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error during logout:", error)
    // Even if there's an error, we should still try to clear the cookie
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
