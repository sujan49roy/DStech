import { type NextRequest, NextResponse } from "next/server"
import { searchContents } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const typeParam = searchParams.get("type")
    const limitParam = searchParams.get("limit")

    console.log("Full Search Request:", {
      query,
      typeParam,
      limitParam,
      userId: user?._id?.toString()
    });

    // Validate query - allow single character searches
    if (!query || query.trim().length < 1) {
      console.error("Search API: Invalid or empty query");
      return NextResponse.json([], { status: 200 })
    }

    // Parse types, handling both single type and multiple types
    const types = typeParam ? typeParam.split(',').map(type => type.trim()) : undefined

    // Parse limit with a default of 5 for dropdown, 50 for full search
    const limit = limitParam ? parseInt(limitParam, 10) : (types ? 5 : 50)

    // Search with or without user ID
    const contents = await searchContents(
      query.trim(),
      user?._id?.toString() || '',
      types,
      limit
    )

    console.log("Search API Response:", {
      resultCount: contents.length,
      firstResult: contents[0]
    });
    return NextResponse.json(contents)
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({
      error: "Failed to search contents",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
