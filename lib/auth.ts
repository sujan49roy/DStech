import { connectToDatabase } from "./mongodb"
import type { User } from "./models"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"
import * as crypto from "crypto"

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // GCM recommended IV length
const SALT_LENGTH = 16; // For key derivation
const KEY_LENGTH = 32; // For AES-256

// Derive a key from NEXTAUTH_SECRET
let encryptionKey: Buffer;
try {
  if (!process.env.NEXTAUTH_SECRET) {
    console.warn("NEXTAUTH_SECRET is not set. GitHub access token encryption will be insecure.");
    // Use a default, less secure key if NEXTAUTH_SECRET is not set (for development/testing only)
    // In a production environment, this should throw an error or ensure NEXTAUTH_SECRET is always set.
    encryptionKey = crypto.scryptSync("default-insecure-secret", "default-salt", KEY_LENGTH);
  } else if (process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn("NEXTAUTH_SECRET is less than 32 bytes. It's recommended to use a stronger secret. Deriving a key using scrypt.");
    // If NEXTAUTH_SECRET is too short, derive a key using scrypt to ensure it's 32 bytes
    const salt = crypto.randomBytes(SALT_LENGTH); // Store or use a fixed salt if you need to regenerate the key
    encryptionKey = crypto.scryptSync(process.env.NEXTAUTH_SECRET, salt, KEY_LENGTH);
  }
  else {
    // If NEXTAUTH_SECRET is long enough, use it directly (or a part of it)
    // For simplicity, we'll hash it to ensure it's exactly KEY_LENGTH bytes
    encryptionKey = crypto.createHash('sha256').update(String(process.env.NEXTAUTH_SECRET)).digest();
  }
} catch (error) {
  console.error("Failed to derive encryption key:", error);
  // Fallback to a default insecure key in case of any error during key derivation
  encryptionKey = crypto.scryptSync("fallback-insecure-secret", "fallback-salt", KEY_LENGTH);
}


export function encryptAccessToken(token: string): string {
  if (!encryptionKey) {
    throw new Error("Encryption key is not initialized.");
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptAccessToken(encryptedTokenString: string): string {
  if (!encryptionKey) {
    throw new Error("Encryption key is not initialized.");
  }
  try {
    const parts = encryptedTokenString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedToken = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt access token:", error);
    // Depending on the use case, you might want to throw the error,
    // return null, or an empty string.
    // For now, re-throwing to make it explicit that decryption failed.
    throw new Error("Failed to decrypt access token.");
  }
}

// Improved password hashing function with salt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  // Generate a random salt if not provided
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');

  // Use PBKDF2 with 1000 iterations and SHA-256
  const hash = crypto.pbkdf2Sync(
    password,
    generatedSalt,
    1000, // iterations
    64,    // key length
    'sha512'
  ).toString('hex');

  return { hash, salt: generatedSalt };
}

// Verify password
export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
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

  // Hash the password with salt
  const { hash, salt } = hashPassword(userData.password);

  // Create the user with hash and salt
  const newUser = {
    ...userData,
    password: hash, // Store hash instead of raw password
    passwordSalt: salt, // Store salt alongside the hash
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

  // Check if user has the old-style password (for backward compatibility)
  if (!user.passwordSalt) {
    // Using old SHA-256 method without salt
    const oldStyleHash = crypto.createHash("sha256").update(password).digest("hex");
    if (user.password !== oldStyleHash) {
    throw new Error("Invalid email or password")
  }

    // Upgrade the password to the new hashing method
    const { hash, salt } = hashPassword(password);
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: hash, passwordSalt: salt, updatedAt: new Date() } }
  );
  } else {
    // Verify password with salt
    if (!verifyPassword(password, user.password, user.passwordSalt)) {
      throw new Error("Invalid email or password")
  }
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

  let isCorrectPassword = false;

  // Check if user has the old-style password (for backward compatibility)
  if (!user.passwordSalt) {
    // Using old SHA-256 method without salt
    const oldStyleHash = crypto.createHash("sha256").update(currentPassword).digest("hex");
    isCorrectPassword = user.password === oldStyleHash;
  } else {
    // Verify password with salt
    isCorrectPassword = verifyPassword(currentPassword, user.password, user.passwordSalt);
  }

  if (!isCorrectPassword) {
    throw new Error("Invalid current password");
  }

  // Hash the new password with salt
  const { hash, salt } = hashPassword(newPassword);

  // Update the password
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: {
      password: hash,
      passwordSalt: salt,
      updatedAt: new Date()
    } }
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

// Find or create a user by GitHub profile
export async function findOrCreateUserByGithubProfile(
  githubId: string,
  githubUsername: string,
  accessToken: string,
  email?: string,
): Promise<User> {
  const { db } = await connectToDatabase();

  if (!encryptionKey) {
    // This should ideally not happen if the key derivation logic at the top is robust.
    console.error("Encryption key is not initialized. Cannot proceed with GitHub user creation/update.");
    throw new Error("Encryption key is not available. Please check server configuration.");
  }

  const encryptedAccessToken = encryptAccessToken(accessToken);

  const existingUser = await db.collection("users").findOne({ githubId });

  if (existingUser) {
    // User found, update their GitHub info if necessary
    const updateFields: Partial<User> = {
      updatedAt: new Date(),
      githubUsername,
      githubAccessToken: encryptedAccessToken,
    };
    // Optionally update email if provided and different,
    // but be cautious about overwriting a verified primary email.
    // For this example, we'll update it if the existing email is null or different.
    if (email && email !== existingUser.email) {
        // If the user currently has no email, or the new email is different, update it.
        // Consider adding a field like `emailVerified: false` if email comes from GitHub and isn't primary.
        updateFields.email = email;
    }


    await db.collection("users").updateOne({ _id: existingUser._id }, { $set: updateFields });

    // Refetch the user to return the updated document
    const updatedUser = await db.collection("users").findOne({ _id: existingUser._id });
    if (!updatedUser) {
        // This case should ideally not happen if the update was successful.
        throw new Error("Failed to retrieve updated user after GitHub profile update.");
    }
    return updatedUser as User;
  } else {
    // No user found with this githubId, create a new user
    const newUser: Omit<User, "_id"> = {
      githubId,
      githubUsername,
      githubAccessToken: encryptedAccessToken,
      email: email || `${githubUsername}@users.noreply.github.com`, // Default email if not provided
      name: githubUsername, // Default name to GitHub username
      password: "", // No password for GitHub-only users
      passwordSalt: "", // No salt for GitHub-only users
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    return {
      ...newUser,
      _id: result.insertedId,
    } as User;
  }
}
