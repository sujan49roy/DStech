import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { logger, apiErrorResponse } from "@/lib/logger";
import type { User } from "@/lib/models";
import { ObjectId } from "mongodb";

interface UserSearchResult extends Partial<User> {
  id?: string; // id is added in mapping, ensure it's part of the interface if used directly
  relationshipStatus: "friends" | "request_sent" | "request_received" | "none";
}

export async function GET(request: NextRequest) {
  let currentUserIdString: string | undefined;
  let searchQueryParam: string | null = null;

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser._id) {
      logger.warn('API: User search - Not authenticated');
      const errResponse = apiErrorResponse("Not authenticated", 401);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    currentUserIdString = currentUser._id.toString();
    const currentUserId = new ObjectId(currentUserIdString);

    searchQueryParam = request.nextUrl.searchParams.get("username"); // Keep consistent with frontend param name

    logger.info({ // Changed to info for better visibility of search queries
        message: "API: User search initiated",
        userId: currentUserIdString,
        searchQuery: searchQueryParam,
    });
    // Log current user's friend/request arrays for context if needed for debugging relationship status
    // logger.debug({
    //     currentUserFriends: currentUser.friends?.map(id => id.toString()),
    //     currentUserOutgoing: currentUser.outgoingRequests?.map(id => id.toString()),
    //     currentUserIncoming: currentUser.incomingRequests?.map(id => id.toString()),
    // });


    if (!searchQueryParam || searchQueryParam.trim().length < 3) {
      logger.warn(`API: User search - Invalid search query: '${searchQueryParam}' by user ${currentUserIdString}`);
      const errResponse = apiErrorResponse("Search query must be at least 3 characters", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>("users");

    const trimmedSearchQuery = searchQueryParam.trim();
    const searchRegex = new RegExp(trimmedSearchQuery, 'i');

    logger.debug({ message: "API: Generated search regex", regex: searchRegex.toString() });

    // **Crucial Diagnostic Step**
    if (trimmedSearchQuery.toLowerCase() === "sujan mishra") { // Using toLowerCase for case-insensitive match
      logger.info(`API: DIAGNOSTIC - Performing direct lookup for "Sujan Mishra" by name field.`);
      const diagnosticUserByName = await usersCollection.findOne({ name: "Sujan Mishra" });
      logger.info({ message: "API: DIAGNOSTIC - Result for findOne({ name: 'Sujan Mishra' })", diagnosticUserByName });

      // Also try with the regex for the specific name to see if regex behaves differently
      logger.info(`API: DIAGNOSTIC - Performing direct lookup for "Sujan Mishra" by name field with regex.`);
      const diagnosticUserByNameRegex = await usersCollection.findOne({ name: searchRegex, _id: { $ne: currentUserId } });
      logger.info({ message: "API: DIAGNOSTIC - Result for findOne({ name: /sujan mishra/i })", diagnosticUserByNameRegex });
    }


    const mongoQuery = {
      _id: { $ne: currentUserId },
      $or: [
        { name: searchRegex },
        { githubUsername: searchRegex }
        // { email: searchRegex } // Optionally add email search if desired and appropriate for privacy
      ]
    };
    logger.debug({ message: "API: MongoDB find query object", query: mongoQuery });

    const projection = {
      _id: 1,
      name: 1,
      email: 1,
      githubUsername: 1,
    };
    logger.debug({ message: "API: MongoDB projection object", projection });

    const foundUsers = await usersCollection.find(mongoQuery, { projection })
     .limit(20)
     .toArray();

    logger.info({ // Changed to info for visibility
        message: "API: Raw users found from DB before relationship status calculation",
        count: foundUsers.length,
        // Log first few users for quick inspection, avoiding overly large log objects
        sampleData: foundUsers.slice(0, 3).map(u => ({ _id: u._id, name: u.name, ghUsername: u.githubUsername }))
    });


    const resultsWithStatus: UserSearchResult[] = foundUsers.map(user => {
      let status: UserSearchResult["relationshipStatus"] = "none";
      const userId = user._id!;

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

      const projectedUser: Partial<User> & { id?: string } = { // Ensure id is part of the type for clarity
        _id: user._id, // Still keeping _id if needed internally or for other mappings
        id: user._id!.toString(), // Explicitly map _id to id as string
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
      };

      return {
        ...projectedUser,
        relationshipStatus: status,
      };
    });

    logger.info({ // Changed to info for visibility
        message: "API: Users with relationship status calculated (final results)",
        count: resultsWithStatus.length,
        sampleData: resultsWithStatus.slice(0,3).map(u => ({ id: u.id, name: u.name, status: u.relationshipStatus }))
    });

    return NextResponse.json(resultsWithStatus, { status: 200 });

  } catch (error: any) {
    logger.error("API: Failed to search users (outer catch block)", {
      userId: currentUserIdString,
      searchQuery: searchQueryParam, // Use the captured searchQueryParam
      errorMessage: error.message,
      errorStack: error.stack,
      errorDetails: error,
    });
    const errResponse = apiErrorResponse("An unexpected error occurred while searching for users.", 500);
    return NextResponse.json(errResponse.json, { status: errResponse.status });
  }
}
