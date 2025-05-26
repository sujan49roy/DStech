import { connectToDatabase } from "./mongodb"
import type { User } from "./models"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"
import * as crypto from "crypto"

// Simple password hashing function
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Create a new user
export async function createUser(userData: Omit<User, "_id" | "createdAt">): Promise<User> {
  const { db } = await connectToDatabase()

  // Check if user already exists
  const existingUser = await db.collection("users").findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Hash the password
  const hashedPassword = hashPassword(userData.password)

  // Create the user
  const newUser = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
  }

  const result = await db.collection("users").insertOne(newUser)

  return {
    ...newUser,
    _id: result.insertedId,
  }
}

// Login a user
export async function loginUser(email: string, password: string): Promise<User> {
  const { db } = await connectToDatabase()

  // Find the user
  const user = await db.collection("users").findOne({ email })
  if (!user) {
    throw new Error("Invalid email or password")
  }

  // Check the password
  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) {
    throw new Error("Invalid email or password")
  }

  return user
}

// Get the current user from the session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return null
  }

  try {
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) {
    return null
  }
}

// Check if the user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

// Logout the user
export async function logoutUser() {
  const cookieStore = cookies()
  cookieStore.delete("userId")
}
