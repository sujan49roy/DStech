import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { logger, apiErrorResponse } from "@/lib/logger";
import { ObjectId } from "mongodb";
import type { User } from "@/lib/models"; // Assuming User is exported from lib/models

export async function POST(request: NextRequest) {
  let currentUserIdString: string | undefined;
  let targetUserIdStringFromRequest: string | undefined; // For logging in catch block
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser._id) {
      const errResponse = apiErrorResponse("Not authenticated", 401);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    currentUserIdString = currentUser._id.toString();
    const currentUserId = new ObjectId(currentUserIdString);

    const body = await request.json();
    targetUserIdStringFromRequest = body.targetUserId; // Assign for logging

    if (!targetUserIdStringFromRequest) {
      const errResponse = apiErrorResponse("Target user ID is required", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    if (!ObjectId.isValid(targetUserIdStringFromRequest)) {
      const errResponse = apiErrorResponse("Invalid target user ID format", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    const targetUserId = new ObjectId(targetUserIdStringFromRequest);

    // Cannot send request to yourself
    if (currentUserId.equals(targetUserId)) {
      const errResponse = apiErrorResponse("Cannot send a friend request to yourself", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>("users");

    // Fetch both users in parallel
    const [userDoc, targetUserDoc] = await Promise.all([
      usersCollection.findOne({ _id: currentUserId }),
      usersCollection.findOne({ _id: targetUserId })
    ]);

    if (!userDoc) {
      // This should ideally not happen if getCurrentUser() is reliable
      logger.error("Current user document not found in DB after successful auth", undefined, { currentUserId: currentUserIdString });
      const errResponse = apiErrorResponse("Current user not found in database", 500);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    if (!targetUserDoc) {
      const errResponse = apiErrorResponse("Target user not found", 404);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Check if already friends
    if (userDoc.friends?.some(friendId => friendId.equals(targetUserId))) {
      const errResponse = apiErrorResponse("You are already friends with this user", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Check if an outgoing request already exists from current user
    if (userDoc.outgoingRequests?.some(reqId => reqId.equals(targetUserId))) {
      const errResponse = apiErrorResponse("Friend request already sent", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Check if an incoming request already exists from target user (meaning target already sent one to current)
    if (userDoc.incomingRequests?.some(reqId => reqId.equals(targetUserId))) {
      const errResponse = apiErrorResponse("This user has already sent you a friend request. Please check your incoming requests.", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Update current user's outgoingRequests
    const updateCurrentUser = usersCollection.updateOne(
      { _id: currentUserId },
      { $addToSet: { outgoingRequests: targetUserId } }
    );

    // Update target user's incomingRequests
    const updateTargetUser = usersCollection.updateOne(
      { _id: targetUserId },
      { $addToSet: { incomingRequests: currentUserId } }
    );

    const [currentUserUpdateResult, targetUserUpdateResult] = await Promise.all([updateCurrentUser, updateTargetUser]);

    if (currentUserUpdateResult.modifiedCount === 0 && targetUserUpdateResult.modifiedCount === 0) {
        // This case could happen if, for example, the request was processed between the read and write (race condition)
        // or if $addToSet didn't add because it's already there (covered by checks above, but good to be aware)
        // For this scenario, it's more likely an existing request was found by one of the earlier checks.
        // However, if we reach here, it implies a potential inconsistency or an edge case not caught.
        logger.warn("Friend request processing resulted in no database modifications, potentially due to existing state not caught by initial checks.", { currentUserId: currentUserIdString, targetUserId: targetUserIdString });
        // We can still return a success-like message as the state is effectively what the user intended (request exists)
        // or a specific message indicating the request might have already been in the intended state.
        // For simplicity, let's assume if checks passed, and we're here, something unexpected happened with DB update.
        // However, the earlier checks for existing requests should prevent this.
        // A more robust approach might re-fetch and double-check the state.
        // Given the current logic, if we're here, it's more like an "already sent" state.
        const errResponse = apiErrorResponse("Friend request may have already been processed or user state is unchanged.", 409); // 409 Conflict
        return NextResponse.json(errResponse.json, { status: errResponse.status });
    }


    return NextResponse.json({ message: "Friend request sent successfully" }, { status: 200 });

  } catch (error) {
    logger.error("Failed to send friend request", error, { currentUserId: currentUserIdString, targetUserId: targetUserIdStringFromRequest });
    const errResponse = apiErrorResponse("Failed to send friend request", 500);
    return NextResponse.json(errResponse.json, { status: errResponse.status });
  }
}
