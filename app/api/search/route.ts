import { type NextRequest, NextResponse } from "next/server"
import { searchContents } from "@/lib/db"
import type { ContentType } from "@/lib/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") as ContentType | undefined

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const contents = await searchContents(query, user._id!.toString(), type)
    return NextResponse.json(contents)
  } catch (error) {
    console.error("Error searching contents:", error)
    return NextResponse.json({ error: "Failed to search contents" }, { status: 500 })
  }
}
