import type { ObjectId } from "mongodb"

export const ContentTypes = ["Blog", "Code Snippet", "Dataset", "Project", "Book", "File"] as const
export type ContentType = (typeof ContentTypes)[number]

export interface Content {
  _id?: ObjectId
  title: string
  description: string
  content: string
  type: ContentType
  tags?: string[]
  coverImage?: string
  fileUrl?: string
  userId: string // Add userId to associate content with users
  createdAt: Date
  updatedAt: Date
}

export interface User {
  _id?: ObjectId
  email: string
  password: string // This will be hashed
  name: string
  createdAt: Date
  updatedAt?: Date
}

export function validateContent(content: Partial<Content>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!content.title || content.title.trim() === "") {
    errors.push("Title is required")
  }

  if (!content.description || content.description.trim() === "") {
    errors.push("Description is required")
  }

  if (!content.content || content.content.trim() === "") {
    errors.push("Content is required")
  }

  if (!content.type || !ContentTypes.includes(content.type as ContentType)) {
    errors.push(`Type must be one of: ${ContentTypes.join(", ")}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUser(user: Partial<User>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!user.email || user.email.trim() === "") {
    errors.push("Email is required")
  } else if (!/\S+@\S+\.\S+/.test(user.email)) {
    errors.push("Email is invalid")
  }

  if (!user.password || user.password.trim() === "") {
    errors.push("Password is required")
  } else if (user.password.length < 6) {
    errors.push("Password must be at least 6 characters")
  }

  if (!user.name || user.name.trim() === "") {
    errors.push("Name is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
