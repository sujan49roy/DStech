import type { ObjectId } from "mongodb"

export const ContentTypes = ["Blog", "Code Snippet", "Dataset", "Project", "Book", "File"] as const
export type ContentType = (typeof ContentTypes)[number]

export interface Content {  _id?: ObjectId
  title: string
  description: string
  content?: string
  type: ContentType
  tags?: string[]
  coverImage?: string
  fileUrl?: string
  userId: string
  slug?: string
  createdAt: string | Date
  updatedAt: string | Date
  // Book-specific fields
  author?: string
  isbn?: string
  publishYear?: string
  genre?: string
  // Code Snippet fields
  language?: string
  // Dataset fields
  dataFormat?: string
  size?: string
  // Project fields
  demoUrl?: string
  githubUrl?: string
  technologies?: string[]
  // File fields
  fileType?: string
}

export interface User {
  _id?: ObjectId
  email: string
  password: string
  passwordSalt?: string // Added for the new password hashing
  name: string
  createdAt: string | Date
  updatedAt?: string | Date
  githubId?: string
  githubAccessToken?: string
  githubUsername?: string
  googleId?: string
  googleAccessToken?: string
  googleEmail?: string
}

// Utility function to generate a slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .slice(0, 100)                // Limit slug length
}

export function validateContent(content: Partial<Content>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!content.title || content.title.trim() === "") {
    errors.push("Title is required")
  }

  if (!content.description || content.description.trim() === "") {
    errors.push("Description is required")
  }

  // Content is required for Blog and Code Snippet types
  if ((content.type === "Blog" || content.type === "Code Snippet" || content.type === "Project") && 
      (!content.content || content.content.trim() === "")) {
    errors.push("Content is required for this content type")
  }

  // FileUrl is required for Dataset, File, and Book types
  if ((content.type === "Dataset" || content.type === "File" || content.type === "Book") && 
      (!content.fileUrl || content.fileUrl.trim() === "")) {
    errors.push("File upload is required for this content type")
  }

  if (!content.type || !ContentTypes.includes(content.type as ContentType)) {
    errors.push(`Type must be one of: ${ContentTypes.join(", ")}`)
  }

  // Optional slug validation
  if (content.slug) {
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/
    if (!slugRegex.test(content.slug)) {
      errors.push("Slug must be lowercase, contain only letters, numbers, and hyphens")
    }
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
  } else if (user.password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }

  if (!user.name || user.name.trim() === "") {
    errors.push("Name is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
