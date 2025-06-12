import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { logger, apiErrorResponse } from "@/lib/logger";
import { ObjectId } from "mongodb"; // ObjectId is used for type checking if needed, and for current user's _id
import type { User } from "@/lib/models";

export async function GET(request: NextRequest) {
  let currentUserIdString: string | undefined;
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser._id) {
      const errResponse = apiErrorResponse("Not authenticated", 401);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    currentUserIdString = currentUser._id.toString();

    if (!currentUser.friends || currentUser.friends.length === 0) {
      return NextResponse.json([], { status: 200 }); // Return empty list if no friends
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>("users");

    // Ensure friend IDs are ObjectIds if they aren't already (they should be from the model)
    const friendObjectIds = currentUser.friends.map(id => typeof id === 'string' ? new ObjectId(id) : id);

    const friends = await usersCollection.find(
      { _id: { $in: friendObjectIds } },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1, // Email might be considered sensitive by some, but often used for identification
          githubUsername: 1, // If available and relevant for display
          // Exclude sensitive fields explicitly if necessary, though projection defines what's included.
          // password: 0, passwordSalt: 0, githubAccessToken: 0, googleAccessToken: 0, etc.
        }
      }
    ).toArray();

    // The result of toArray() will be User[] but with only projected fields.
    // We might want to map it to a more specific FriendSummary type if defined.
    // For now, returning the projected User objects is fine.

    return NextResponse.json(friends, { status: 200 });

  } catch (error) {
    logger.error("Failed to fetch friend list", error, { userId: currentUserIdString });
    const errResponse = apiErrorResponse("Failed to fetch friend list", 500);
    return NextResponse.json(errResponse.json, { status: errResponse.status });
  }
}
