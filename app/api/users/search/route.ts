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
  let searchQueryParam: string | null = null; // For logging in catch

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser._id) {
      logger.warn('API: User search - Not authenticated');
      const errResponse = apiErrorResponse("Not authenticated", 401);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    currentUserIdString = currentUser._id.toString();
    const currentUserId = new ObjectId(currentUserIdString);

    searchQueryParam = request.nextUrl.searchParams.get("username");
    logger.debug({
        message: "API: User search initiated",
        userId: currentUserIdString,
        searchQuery: searchQueryParam,
        currentUserFriends: currentUser.friends?.length,
        currentUserOutgoing: currentUser.outgoingRequests?.length,
        currentUserIncoming: currentUser.incomingRequests?.length,
    });

    if (!searchQueryParam || searchQueryParam.trim().length < 3) {
      logger.warn(`API: User search - Invalid search query: '${searchQueryParam}' by user ${currentUserIdString}`);
      const errResponse = apiErrorResponse("Search query must be at least 3 characters", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>("users");

    const searchRegex = new RegExp(searchQueryParam.trim(), 'i'); // Case-insensitive regex

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

    logger.debug({ message: "Raw users found from DB", count: foundUsers.length, data: foundUsers.map(u => u._id) });

    const resultsWithStatus: UserSearchResult[] = foundUsers.map(user => {
      let status: UserSearchResult["relationshipStatus"] = "none";
      const userId = user._id!; // _id is guaranteed by projection

      // Ensure currentUser fields are arrays before calling .some()
      const friends = Array.isArray(currentUser.friends) ? currentUser.friends : [];
      const outgoingRequests = Array.isArray(currentUser.outgoingRequests) ? currentUser.outgoingRequests : [];
      const incomingRequests = Array.isArray(currentUser.incomingRequests) ? currentUser.incomingRequests : [];

      if (friends.some(friendId => friendId.equals(userId))) {
        status = "friends";
      } else if (outgoingRequests.some(reqId => reqId.equals(userId))) {
        status = "request_sent";
      } else if (incomingRequests.some(reqId => reqId.equals(userId))) {
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
        ...projectedUser, // Spread projected fields
        id: user._id.toString(), // Add string id for frontend consistency
        relationshipStatus: status,
      };
    });

    logger.debug({ message: "Users with relationship status calculated", count: resultsWithStatus.length, data: resultsWithStatus.map(u => ({id: u.id, status: u.relationshipStatus})) });
    logger.info(`API: User search by ${currentUserIdString} for query "${searchQueryParam}" returned ${resultsWithStatus.length} results.`);
    return NextResponse.json(resultsWithStatus, { status: 200 });

  } catch (error: any) {
    logger.error("API: Failed to search users", {
      userId: currentUserIdString,
      searchQuery: searchQueryParam,
      errorMessage: error.message,
      errorStack: error.stack,
      errorDetails: error,
    });
    const errResponse = apiErrorResponse("An unexpected error occurred while searching for users.", 500);
    return NextResponse.json(errResponse.json, { status: errResponse.status });
  }
}
