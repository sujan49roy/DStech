import { ObjectId } from "mongodb"
import { connectToDatabase } from "./mongodb"
import type { Content, ContentType } from "./models"

export async function getContents(userId: string, type?: ContentType) {
  const { db } = await connectToDatabase()

  const query = type ? { type, userId } : { userId }
  const contents = await db.collection("contents").find(query).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(contents))
}

export async function getContentById(id: string, userId?: string) {
  const { db } = await connectToDatabase()

  const query: any = { _id: new ObjectId(id) }
  if (userId) {
    query.userId = userId
  }

  const content = await db.collection("contents").findOne(query)

  return JSON.parse(JSON.stringify(content))
}

export async function getContentBySlug(slug: string, type: ContentType, userId?: string) {
  const { db } = await connectToDatabase()

  const query: any = { slug, type }
  if (userId) {
    query.userId = userId
  }

  const content = await db.collection("contents").findOne(query)

  return JSON.parse(JSON.stringify(content))
}

export async function createContent(content: Content) {
  const { db } = await connectToDatabase()

  // Generate a slug from the title if not provided
  if (!content.slug) {
    content.slug = content.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single one
  }

  const now = new Date()
  const newContent = {
    ...content,
    createdAt: now,
    updatedAt: now,
  }

  const result = await db.collection("contents").insertOne(newContent)

  return {
    ...newContent,
    _id: result.insertedId,
  }
}
export async function updateContent(id: string, content: Partial<Content>, userId: string) {
  const { db } = await connectToDatabase()

  // Update slug if title is being updated and slug wasn't explicitly provided
  if (content.title && !content.slug) {
    content.slug = content.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const now = new Date()
  const updatedContent = {
    ...content,
    updatedAt: now,
  }

  await db.collection("contents").updateOne({ _id: new ObjectId(id), userId }, { $set: updatedContent })

  return getContentById(id)
}
export async function deleteContent(id: string, userId: string) {
  const { db } = await connectToDatabase()

  await db.collection("contents").deleteOne({ _id: new ObjectId(id), userId })

  return { success: true }
}

export async function searchContents(query: string, userId: string, types?: string[], limit = 10) {
  console.log("Search Parameters:", { query, userId, types, limit });

  const { db } = await connectToDatabase()

  // Log all documents to verify data
  const allDocuments = await db.collection("contents").find({}).toArray()
  console.log("Total Documents:", allDocuments.length)
  console.log("Sample Documents:", allDocuments.slice(0, 5))

  // Construct search query - fix the userId comparison
  const baseQuery: any = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }

  // Add userId if provided - keeping it as string to match the database format
  if (userId) {
    baseQuery.userId = userId;
  }

  // Add type filter if provided
  if (types && types.length > 0) {
    baseQuery.type = { $in: types }
  }

  console.log("Base Search Query:", JSON.stringify(baseQuery, null, 2))

  try {
    // Execute the search query without projection to see if results are found
    const rawResults = await db.collection("contents")
      .find(baseQuery)
    .toArray();

    console.log("Raw Results Count:", rawResults.length);

    if (rawResults.length > 0) {
      console.log("First Raw Result:", rawResults[0]);
    }

    // Now execute with proper projection and limit
    const contents = await db.collection("contents")
      .find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    console.log("Search Results Count:", contents.length);
    if (contents.length > 0) {
      console.log("First Few Results:", contents.slice(0, Math.min(5, contents.length)));
    } else {
      console.log("First Few Results: []");
}

    return JSON.parse(JSON.stringify(contents))
  } catch (error) {
    console.error("Search Error:", error);
    return [];
}
}
