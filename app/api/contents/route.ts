import { type NextRequest, NextResponse } from "next/server"
import { createContent, getContents } from "@/lib/db"
import { validateContent } from "@/lib/models"
import type { ContentType } from "@/lib/models"
import { getCurrentUser } from "@/lib/auth"
import { logger, apiErrorResponse } from "@/lib/logger" // Import logger and helper

export async function GET(request: NextRequest) {
  let userId: string | undefined;
  try {
    const user = await getCurrentUser()
    if (!user) {
      const response = apiErrorResponse("Not authenticated", 401)
      return NextResponse.json(response.json, { status: response.status })
    }
    userId = user._id?.toString();

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as ContentType | undefined

    const contents = await getContents(userId!, type) // userId is guaranteed to be set if user was found
    return NextResponse.json(contents)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch contents due to an unexpected error."
    logger.error("Failed to fetch contents", error, { userId, url: request.url })
    const response = apiErrorResponse(errorMessage, 500)
    return NextResponse.json(response.json, { status: response.status })
  }
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let contentData: any; // To store contentData for logging in catch block
  try {
    const user = await getCurrentUser()
    if (!user) {
      const response = apiErrorResponse("Not authenticated", 401)
      return NextResponse.json(response.json, { status: response.status })
    }
    userId = user._id?.toString();

    contentData = await request.json()

    // Ensure content field is present for types that require it
    if (contentData.type === "Blog" || contentData.type === "Code Snippet" || contentData.type === "Project") {
      if (!contentData.content || contentData.content.trim() === "") {
        const response = apiErrorResponse("Validation failed", 400, ["Content is required for this content type"])
        return NextResponse.json(response.json, { status: response.status })
      }
    }

    // Ensure fileUrl field is present for types that require it
    if (contentData.type === "Dataset" || contentData.type === "File" || contentData.type === "Book") {
      if (!contentData.fileUrl || contentData.fileUrl.trim() === "") {
        const response = apiErrorResponse("Validation failed", 400, ["File upload is required for this content type"])
        return NextResponse.json(response.json, { status: response.status })
      }
    }

    // Validate content
    const validation = validateContent(contentData)
    if (!validation.isValid) {
      const response = apiErrorResponse("Validation failed", 400, validation.errors)
      return NextResponse.json(response.json, { status: response.status })
    }

    // Add the user ID to the content
    const contentWithUser = { // contentData is defined above
      ...contentData,
      userId: userId!, // userId is guaranteed to be set
    }

    const newContent = await createContent(contentWithUser)
    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create content due to an unexpected error."
    // Log only relevant parts of contentData, not potentially large file contents if any were part of it
    const { content, ...loggableContentData } = contentData || {};
    logger.error("Failed to create content", error, { userId, contentData: loggableContentData })
    const response = apiErrorResponse(errorMessage, 500)
    return NextResponse.json(response.json, { status: response.status })
  }
}
