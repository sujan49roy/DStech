import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { type User } from "@/lib/models";
import { logger } from '@/lib/logger';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/utils';

export async function GET() {
  let currentUserId: string | undefined;
  try {
    // No db connection here yet, happens after currentUser check
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) { // currentUser.id is typically string from getCurrentUser
      logger.warn('API: Incoming friend requests - Unauthorized or invalid user object.');
      return apiErrorResponse('Unauthorized', 401);
    }
    currentUserId = currentUser.id; // Store for logging in outer catch

    // Aggressive Debugging Point 1: Log current user and raw incomingRequests
    logger.debug({
        message: "DEBUG: Initial user details",
        userId: currentUserId,
        rawIncomingRequests: currentUser.incomingRequests // Assuming incomingRequests is directly on currentUser from getCurrentUser()
    });

    if (!currentUser.incomingRequests || !Array.isArray(currentUser.incomingRequests)) {
        logger.warn({
            message: "DEBUG: currentUser.incomingRequests is null, undefined, or not an array.",
            userId: currentUserId,
            incomingRequestsType: typeof currentUser.incomingRequests,
            incomingRequestsValue: currentUser.incomingRequests
        });
        return NextResponse.json([], { status: 200 }); // Return empty array as per requirement
    }

    if (currentUser.incomingRequests.length === 0) {
        logger.info({
            message: "DEBUG: currentUser.incomingRequests is an empty array.",
            userId: currentUserId
        });
        return NextResponse.json([], { status: 200 }); // Return empty array
    }

    // await connectToDB(); // Connect to DB after initial checks - This call is sufficient if connectToDB handles existing connections.
    const db = await connectToDB(); // connectToDB should handle existing connection or create new.
    const usersCollection = db.collection<User>("users");

    // Fetch the user document again to ensure we have the absolute latest from DB, if needed.
    // However, getCurrentUser() should ideally provide a fresh enough representation for this.
    // For this debugging, let's trust currentUser.incomingRequests from getCurrentUser initially.
    // If an issue is suspected with stale data from getCurrentUser, then re-fetching userWithRequests is good.
    // The previous version did fetch userWithRequests. Let's keep it for consistency with prior logic.
     const userWithDbRequests = await usersCollection.findOne(
        { _id: new ObjectId(currentUserId) },
        { projection: { incomingRequests: 1 } }
    );

    logger.debug({
        message: "Current user's data from DB for incoming requests processing",
        userId: currentUserId,
        retrievedIncomingRequests: userWithDbRequests?.incomingRequests
    });

    // Use userWithDbRequests for the source of truth for incomingRequests from this point
    const actualIncomingRequests = userWithDbRequests?.incomingRequests;

    if (!actualIncomingRequests || !Array.isArray(actualIncomingRequests) || actualIncomingRequests.length === 0) {
      logger.info(`API: User ${currentUserId} has no incoming friend requests in DB or field is invalid.`);
      return apiSuccessResponse([], 200);
    }


    // Aggressive Debugging Point 2: ObjectId Conversion and Filtering
    const incomingRequestUserIds = actualIncomingRequests.map(id => {
        if (!id || !ObjectId.isValid(id.toString())) { // Check validity before creating ObjectId
            logger.warn({ message: "DEBUG: Invalid or null ID found in incomingRequests array before ObjectId conversion", userId: currentUserId, idValue: id });
            return null;
        }
        return new ObjectId(id.toString());
    }).filter(id => id !== null) as ObjectId[];

    logger.debug({ message: "DEBUG: incomingRequestUserIds after ObjectId conversion and filtering", userId: currentUserId, data: incomingRequestUserIds });

    if (incomingRequestUserIds.length === 0) {
        logger.info({
            message: "DEBUG: incomingRequestUserIds is empty after filtering.",
            userId: currentUserId,
            originalCount: actualIncomingRequests.length
        });
        return NextResponse.json([], { status: 200 }); // Return empty array
    }

    // Aggressive Debugging Point 3: Database Query for Requesters
    const findQuery = { _id: { $in: incomingRequestUserIds } };
    const projectionOptions = { _id: 1, username: 1, name: 1, ghUsername: 1, email: 1 };
    logger.debug({ message: "DEBUG: Executing usersCollection.find() with query", userId: currentUserId, query: findQuery, projection: projectionOptions });

    const requesters = await usersCollection.find(findQuery)
    .project(projectionOptions)
    .toArray();

    logger.debug({ message: "DEBUG: Raw requesters array from database", userId: currentUserId, count: requesters.length, data: requesters });

    // Aggressive Debugging Point 4: Data Transformation
    let formattedRequesters: any[] = [];
    try {
        formattedRequesters = requesters.map(user => {
            if (!user || !user._id) { // Add a check for user and user._id
                logger.warn({ message: "DEBUG: Encountered null user or user without _id during mapping", problematicUser: user });
                throw new Error("Invalid user object encountered during mapping."); // This will be caught by inner try-catch
            }
            return {
                ...user,
                id: user._id.toString(),
            };
        });
        logger.debug({ message: "DEBUG: formattedRequesters after mapping", userId: currentUserId, data: formattedRequesters });
    } catch (e: any) {
        logger.error("API: DEBUG: Failed during data transformation (requesters.map)", {
            userId: currentUserId,
            errorMessage: e.message,
            errorStack: e.stack,
            requestersData: requesters // Log the data that caused failure
        });
        const errorResponse = apiErrorResponse('Failed during data transformation', 500, { error: e.message });
        return NextResponse.json(errorResponse.json, { status: errorResponse.status });
    }

    // Aggressive Debugging Point 5: Final Response Serialization Protection
    try {
        JSON.stringify(formattedRequesters); // Attempt to serialize
        logger.info(`API: User ${currentUserId} fetched ${formattedRequesters.length} incoming friend requests successfully (pre-serialization check passed).`);
        return apiSuccessResponse(formattedRequesters, 200);
    } catch (e: any) {
        logger.error("API: DEBUG: Failed to serialize final formattedRequesters", {
            userId: currentUserId,
            errorMessage: e.message,
            errorStack: e.stack,
            // Avoid logging formattedRequesters directly if it's huge or causes stringify issues itself in logs
            // formattedRequestersDataShape: formattedRequesters.map(r => ({ id: r.id, keys: Object.keys(r) }))
        });
        const errorResponse = apiErrorResponse('Failed to serialize final response', 500, { error: e.message });
        return NextResponse.json(errorResponse.json, { status: errorResponse.status });
    }

  } catch (error: any) {
    // Aggressive Debugging Point 6: Outer Catch Block
    logger.error('API: Critical unhandled error in fetching incoming friend requests:', {
        userId: currentUserId || 'N/A', // currentUserId might not be set if error is early
        errorMessage: error.message,
        errorStack: error.stack,
        errorDetails: error
    });
    // Ensure a valid JSON response is always sent
    // The apiErrorResponse utility should handle creating the correct NextResponse structure
    return apiErrorResponse('An internal server error occurred while fetching incoming friend requests.', 500);
  }
}
