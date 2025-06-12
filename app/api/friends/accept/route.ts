import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { logger, apiErrorResponse } from "@/lib/logger";
import { ObjectId } from "mongodb";
import type { User } from "@/lib/models";

export async function POST(request: NextRequest) {
  let currentUserIdString: string | undefined;
  let requesterUserIdStringFromRequest: string | undefined;

  try {
    const acceptingUser = await getCurrentUser();
    if (!acceptingUser || !acceptingUser._id) {
      const errResponse = apiErrorResponse("Not authenticated", 401);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    currentUserIdString = acceptingUser._id.toString();
    const acceptingUserId = new ObjectId(currentUserIdString);

    const body = await request.json();
    requesterUserIdStringFromRequest = body.requesterUserId;

    if (!requesterUserIdStringFromRequest) {
      const errResponse = apiErrorResponse("Requester user ID is required", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    if (!ObjectId.isValid(requesterUserIdStringFromRequest)) {
      const errResponse = apiErrorResponse("Invalid requester user ID format", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }
    const requesterUserId = new ObjectId(requesterUserIdStringFromRequest);

    if (acceptingUserId.equals(requesterUserId)) {
      const errResponse = apiErrorResponse("Invalid operation: Cannot accept a request from yourself", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>("users");

    // Fetch both user documents
    // It's important to re-fetch the acceptingUser doc to ensure we have the latest request arrays
    const [acceptingUserDoc, requesterUserDoc] = await Promise.all([
      usersCollection.findOne({ _id: acceptingUserId }),
      usersCollection.findOne({ _id: requesterUserId })
    ]);

    if (!acceptingUserDoc) {
      logger.error("Accepting user document not found in DB after successful auth", undefined, { currentUserId: currentUserIdString });
      const errResponse = apiErrorResponse("Your user profile was not found in the database.", 500);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    if (!requesterUserDoc) {
      const errResponse = apiErrorResponse("Requesting user not found", 404);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Validate the request state
    const hasIncomingRequest = acceptingUserDoc.incomingRequests?.some(id => id.equals(requesterUserId));
    const requesterHasOutgoing = requesterUserDoc.outgoingRequests?.some(id => id.equals(acceptingUserId));

    if (!hasIncomingRequest || !requesterHasOutgoing) {
      // Log this inconsistency for review
      logger.warn("Friend request acceptance failed due to inconsistent request state.", {
        acceptingUserId: currentUserIdString,
        requesterUserId: requesterUserIdStringFromRequest,
        acceptingUserHasIncoming: !!hasIncomingRequest,
        requesterUserHasOutgoing: !!requesterHasOutgoing,
        acceptingUserIncomingRequests: acceptingUserDoc.incomingRequests,
        requesterUserOutgoingRequests: requesterUserDoc.outgoingRequests,
      });
      const errResponse = apiErrorResponse("No pending friend request found or the request is invalid.", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Check if already friends (data consistency check)
    if (acceptingUserDoc.friends?.some(friendId => friendId.equals(requesterUserId))) {
      logger.warn("Attempted to accept friend request for users who are already friends. This indicates an invalid request state.", {
         acceptingUserId: currentUserIdString, requesterUserId: requesterUserIdStringFromRequest
      });
      // Clean up potentially orphaned request state as a corrective measure, then inform client.
      // This is important because the UI might be out of sync.
      await usersCollection.updateOne({ _id: acceptingUserId }, { $pull: { incomingRequests: requesterUserId } });
      await usersCollection.updateOne({ _id: requesterUserId }, { $pull: { outgoingRequests: acceptingUserId } });

      const errResponse = apiErrorResponse("Already friends. The request was invalid or already processed.", 400);
      return NextResponse.json(errResponse.json, { status: errResponse.status });
    }

    // Perform updates
    // Using Promise.all for parallel execution, though not a true transaction without replica set/sharding.
    // If one fails, the other might have succeeded, leading to partial state.
    // For more robust atomicity, MongoDB transactions would be needed.
    const updateAcceptingUser = usersCollection.updateOne(
      { _id: acceptingUserId },
      {
        $pull: { incomingRequests: requesterUserId },
        $addToSet: { friends: requesterUserId }
      }
    );

    const updateRequesterUser = usersCollection.updateOne(
      { _id: requesterUserId },
      {
        $pull: { outgoingRequests: acceptingUserId },
        $addToSet: { friends: acceptingUserId }
      }
    );

    await Promise.all([updateAcceptingUser, updateRequesterUser]);

    // It's good practice to check result.modifiedCount if needed, but for $pull/$addToSet,
    // if the state was already correct (e.g., request already removed, friend already added),
    // modifiedCount might be 0. The important part is the final state is achieved.

    return NextResponse.json({ message: "Friend request accepted successfully" }, { status: 200 });

  } catch (error) {
    logger.error("Failed to accept friend request", error, {
      currentUserId: currentUserIdString,
      requesterUserId: requesterUserIdStringFromRequest
    });
    const errResponse = apiErrorResponse("Failed to accept friend request", 500);
    return NextResponse.json(errResponse.json, { status: errResponse.status });
  }
}
