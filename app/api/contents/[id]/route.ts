import { type NextRequest, NextResponse } from "next/server"
import { getContentById, updateContent, deleteContent } from "@/lib/db"
import { validateContent } from "@/lib/models"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    // For GET, we'll allow viewing content without authentication
    // but if user is logged in, we'll only show their content
    const content = await getContentById(params.id, user?._id?.toString())

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if the content belongs to the user
    const existingContent = await getContentById(params.id)
    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    if (existingContent.userId !== user._id!.toString()) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const updatedContent = await updateContent(params.id, contentData, user._id!.toString())

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if the content belongs to the user
    const existingContent = await getContentById(params.id)
    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    if (existingContent.userId !== user._id!.toString()) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    await deleteContent(params.id, user._id!.toString())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}
