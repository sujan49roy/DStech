import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local or Vercel environment variables")
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

// Global is used here to maintain a cached connection across hot reloads
// in development and to prevent connections growing exponentially in production
let cached = global.mongo

if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

export async function connectToDatabase() {
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
          db: client.db("dstech"),
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
