import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

// Define locally to avoid dependency issues
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
}
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Find all content items without slugs
    const contentWithoutSlug = await db.collection("contents")
      .find({ slug: { $exists: false } })
      .toArray()

    const updates = []
    
    // Update each content item with a slug
    for (const content of contentWithoutSlug) {
      const slug = generateSlug(content.title)
      
      // Check if slug already exists for this type
      const existing = await db.collection("contents").findOne({ 
        type: content.type, 
        slug,
        _id: { $ne: content._id } 
      })
      
      // If exists, make it unique by adding a timestamp
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug
      
      updates.push({
        updateOne: {
          filter: { _id: content._id },
          update: { $set: { slug: finalSlug } }
        }
      })
    }

    // Perform bulk update if needed
    let result = { matchedCount: 0, modifiedCount: 0 }
    if (updates.length > 0) {
      result = await db.collection("contents").bulkWrite(updates)
    }

    return NextResponse.json({ 
      success: true, 
      itemsUpdated: result.modifiedCount,
      totalItems: contentWithoutSlug.length
    })
  } catch (error) {
    console.error("Error migrating slugs:", error)
    return NextResponse.json({ 
      error: "Failed to migrate slugs",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}