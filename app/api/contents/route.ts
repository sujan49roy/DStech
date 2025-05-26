import { type NextRequest, NextResponse } from "next/server"
import { createContent, getContents } from "@/lib/db"
import { validateContent } from "@/lib/models"
import type { ContentType } from "@/lib/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as ContentType | undefined

    const contents = await getContents(user._id!.toString(), type)
    return NextResponse.json(contents)
  } catch (error) {
    console.error("Error fetching contents:", error)
    return NextResponse.json({ error: "Failed to fetch contents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const contentData = await request.json()

    // Validate content
    const validation = validateContent(contentData)
    if (!validation.isValid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    // Add the user ID to the content
    const contentWithUser = {
      ...contentData,
      userId: user._id!.toString(),
    }

    const newContent = await createContent(contentWithUser)
    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 })
  }
}
