import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { logger, apiErrorResponse } from "@/lib/logger";
import type { User } from "@/lib/models"; // Assuming User is exported from lib/models
import { ObjectId } from "mongodb";

// Define a type for the search results to include relationship status
interface UserSearchResult extends Partial<User> { // Use Partial<User> for projected fields
  relationshipStatus: "friends" | "request_sent" | "request_received" | "none";
}

export async function GET(request: NextRequest) {
  let currentUserIdString: string | undefined;
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser._id) {
      const errResponse = apiErrorResponse("Not authenticated", 401);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    currentUserIdString = currentUser._id.toString();
    const currentUserId = new ObjectId(currentUserIdString);

    const searchQuery = request.nextUrl.searchParams.get("username");

    if (!searchQuery || searchQuery.trim().length < 3) {
      const errResponse = apiErrorResponse("Search query must be at least 3 characters", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>("users");

    const searchRegex = new RegExp(searchQuery.trim(), 'i'); // Case-insensitive regex

    const foundUsers = await usersCollection.find(
      {
        _id: { $ne: currentUserId }, // Exclude current user
        $or: [
          { name: searchRegex },
          { githubUsername: searchRegex }
          // Add other fields like a dedicated 'username' if it exists on the User model
        ]
      },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1, // Consider if email should be returned in search results; often yes for identification
          githubUsername: 1,
          // Exclude sensitive data by not including them
        }
      }
    ).limit(20) // Limit results to prevent overly large responses
     .toArray();

    const resultsWithStatus: UserSearchResult[] = foundUsers.map(user => {
      let status: UserSearchResult["relationshipStatus"] = "none";
      const userId = user._id!; // _id is guaranteed by projection

      if (currentUser.friends?.some(friendId => friendId.equals(userId))) {
        status = "friends";
      } else if (currentUser.outgoingRequests?.some(reqId => reqId.equals(userId))) {
        status = "request_sent";
      } else if (currentUser.incomingRequests?.some(reqId => reqId.equals(userId))) {
        status = "request_received";
      }

      // Ensure only projected fields are part of the user object returned
      const projectedUser: Partial<User> = {
        _id: user._id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
      };

      return {
        ...projectedUser,
        relationshipStatus: status,
      };
    });

    return NextResponse.json(resultsWithStatus, { status: 200 });

  } catch (error) {
    logger.error("Failed to search users", error, {
      userId: currentUserIdString,
      searchQuery: request.nextUrl.searchParams.get("username")
    });
    const errResponse = apiErrorResponse("Failed to search users", 500);
    return NextResponse.json(errResponse.json, { status: errResponse.status });
  }
}
