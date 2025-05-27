
import { NextResponse } from 'next/server'
import { connectToDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    
        if (!user) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }
    
        const { db } = await connectToDatabase()
    
        // Delete the user from the database
        const result = await db.collection("users").deleteOne({
          _id: new ObjectId(user._id)
        })
    
        if (result.deletedCount === 0) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
    
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
      } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
      }
    }
    