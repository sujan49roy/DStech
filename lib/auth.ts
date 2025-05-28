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
// 导出一个异步函数，用于创建用户
export async function createUser(userData: Omit<User, "_id" | "createdAt">): Promise<User> {
  // 连接到数据库
  const { db } = await connectToDatabase()

  // Check ifuser already exists
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
  const userId = (await cookieStore).get("userId")?.value

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
  ;(await cookieStore).delete("userId")
}
 

// Update user name and email
export async function updateUser(
  userId: string,
  userData: Partial<Omit<User, "_id" | "createdAt" | "password">>,
): Promise<User> {
  const { db } = await connectToDatabase();

  const currentUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!currentUser) {
    throw new Error("User not found");
  }

  // If email is being updated, check if the new email already exists for another user
  if (userData.email && userData.email !== currentUser.email) {
    const existingUserWithNewEmail = await db
      .collection("users")
      .findOne({ email: userData.email });
    if (existingUserWithNewEmail && existingUserWithNewEmail._id.toString() !== userId) {
      throw new Error("User with this email already exists");
    }
  }

  // Prepare the data for update
  const updatePayload: { $set: Partial<User> } = { $set: {} }; // Initialize $set as an empty object

  if (userData.name !== undefined) { // Check for undefined to allow clearing a name if desired (though typically not)
    updatePayload.$set.name = userData.name;
  }
  if (userData.email !== undefined) {
    updatePayload.$set.email = userData.email;
  }
  
  // Only add updatedAt if there are actual changes to name or email
  if (userData.name !== undefined || userData.email !== undefined) {
    updatePayload.$set.updatedAt = new Date();
  }


  // Only proceed if there's something to update (name or email)
  if (Object.keys(updatePayload.$set).length === 0 || (Object.keys(updatePayload.$set).length === 1 && updatePayload.$set.updatedAt)) {
    // No actual data fields to update other than potentially just updatedAt
    // If only updatedAt is set, it means no name/email was provided for update.
    // In this case, we can return the current user as is, or throw an error if an update was expected.
    // For simplicity, returning current user if no actual fields changed.
     if (Object.keys(updatePayload.$set).length === 1 && updatePayload.$set.updatedAt && !userData.name && !userData.email) {
        return currentUser as User;
     }
     // If updatePayload.$set is truly empty (no name, email, or updatedAt), also return current user.
     if (Object.keys(updatePayload.$set).length === 0) {
        return currentUser as User;
     }
  }
  
  const result = await db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, updatePayload);

  if (result.matchedCount === 0) {
     throw new Error("User not found, update failed.");
  }

  const updatedUserDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!updatedUserDoc) {
    throw new Error("Failed to retrieve updated user information.");
  }
  return updatedUserDoc as User;
}
// Update user password
export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  const { db } = await connectToDatabase();

  // Find the user
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error("User not found");
  }

  // Check the current password
  const hashedCurrentPassword = hashPassword(currentPassword);
  if (user.password !== hashedCurrentPassword) {
    throw new Error("Invalid current password");
  }

  // Hash the new password
  const hashedNewPassword = hashPassword(newPassword);

  // Update the password
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedNewPassword, updatedAt: new Date() } }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Failed to update password");
  }

  return { success: true, message: "Password updated successfully" };
}

// Delete user
export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  const { db } = await connectToDatabase();

  // Find the user to ensure it exists before attempting deletion (optional, but good practice)
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) {
    // Or handle as success if idempotent deletion is preferred
    throw new Error("User not found, cannot delete.");
  }

  const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

  if (result.deletedCount === 0) {
    throw new Error("Failed to delete user");
  }

  // Invalidate cookie after successful deletion
  const cookieStore = cookies();
  (await cookieStore).delete("userId");

  return { success: true, message: "User deleted successfully" };
}
