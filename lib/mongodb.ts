import { MongoClient, Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local or Vercel environment variables")
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 20, // Increased from 10 to 20 for better performance
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

// Define proper types for the cached connection
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

interface CachedConnection {
  conn: MongoConnection | null;
  promise: Promise<MongoConnection> | null;
}

// Global is used here to maintain a cached connection across hot reloads
// in development and to prevent connections growing exponentially in production
let cached: CachedConnection = (global as any).mongo

if (!cached) {
  cached = (global as any).mongo = { conn: null, promise: null }
}
export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const client = new MongoClient(uri, options)
    cached.promise = client
      .connect()
      .then((client) => {
        return {
          client,
          db: client.db(process.env.MONGODB_DB_NAME || "dstech"), // Use env variable or default
        }
      })
      .catch((error) => {
        console.error("Failed to connect to MongoDB", error)
        throw error
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

