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

export async function createContent(content: Content) {
  const { db } = await connectToDatabase()

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

export async function searchContents(query: string, userId: string, type?: ContentType) {
  const { db } = await connectToDatabase()

  const searchQuery: any = {
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ],
    userId,
  }

  if (type) {
    searchQuery.type = type
  }

  const contents = await db.collection("contents").find(searchQuery).sort({ createdAt: -1 }).toArray()

  return JSON.parse(JSON.stringify(contents))
}
