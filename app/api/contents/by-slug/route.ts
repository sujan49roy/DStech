import { NextRequest, NextResponse } from "next/server"
import { getContentBySlug } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { ContentType } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const type = searchParams.get("type") as ContentType | undefined

    if (!slug || !type) {
      return NextResponse.json({ error: "Slug and type parameters are required" }, { status: 400 })
    }

    const content = await getContentBySlug(slug, type, user._id!.toString())
    
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content by slug:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}