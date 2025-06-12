import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; // Added ObjectId
import { getCurrentUser } from '@/lib/auth'; // Assuming this utility exists and works
import { connectToDB } from '@/lib/db'; // Assuming this utility exists
import { type User } from "@/lib/models"; // Corrected import
import { logger } from '@/lib/logger'; // Assuming logger utility
import { apiErrorResponse, apiSuccessResponse } from '@/lib/utils'; // Assuming response utilities

export async function GET() {
  try {
    await connectToDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      logger.warn('API: Incoming friend requests - Unauthorized access attempt.');
      return apiErrorResponse('Unauthorized', 401);
    }

    const db = await connectToDB();
    const usersCollection = db.collection<User>("users");

    const userWithRequests = await usersCollection.findOne(
        { _id: new ObjectId(currentUser.id) },
        { projection: { incomingRequests: 1 } }
    );

    // Log current user's incoming requests array
    logger.debug({
        message: "Current user's data for incoming requests processing",
        userId: currentUser?.id,
        retrievedIncomingRequests: userWithRequests?.incomingRequests
    });

    if (!userWithRequests || !userWithRequests.incomingRequests || userWithRequests.incomingRequests.length === 0) {
      logger.info(`API: User ${currentUser.id} has no incoming friend requests or document field is empty/missing.`);
      return apiSuccessResponse([], 200);
    }

    // Ensure incomingRequestUserIds are ObjectIds for the $in query
    const incomingRequestUserIds = userWithRequests.incomingRequests.map(id => {
        if (!id) {
            logger.warn({ message: "Null or undefined ID found in incomingRequests array", userId: currentUser?.id });
            return null; // Will be filtered out later
        }
        return new ObjectId(id.toString());
    }).filter(id => id !== null) as ObjectId[]; // Filter out any nulls that might have resulted from bad data

    if (incomingRequestUserIds.length === 0) {
        logger.info(`API: User ${currentUser.id} had incoming requests, but they resolved to an empty list of valid ObjectIds (e.g. contained only nulls).`);
        return apiSuccessResponse([], 200);
    }

    logger.debug({ message: "Processing valid incoming request ObjectIds", data: incomingRequestUserIds });

    // Fetch details for each user in incomingRequests
    const requesters = await usersCollection.find(
        { _id: { $in: incomingRequestUserIds } }
    )
    .project({ _id: 1, username: 1, name: 1, ghUsername: 1, email: 1 })
    .toArray();

    logger.debug({ message: "Fetched requester user objects from DB", data: requesters });

    // Map _id to id for consistency with frontend SearchUser interface
    const formattedRequesters = requesters.map(user => ({
      ...user,
      id: user._id.toString(),
    }));

    logger.debug({ message: "Formatted requester user objects for response", data: formattedRequesters });
    logger.info(`API: User ${currentUser.id} fetched ${formattedRequesters.length} incoming friend requests successfully.`);
    return apiSuccessResponse(formattedRequesters, 200);

  } catch (error: any) { // Catch any type for more detailed logging
    logger.error('API: Critical error in fetching incoming friend requests:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorDetails: error, // Log the whole error object
        userId: (error as any).currentUser?.id || 'N/A' // Attempt to get userId if available in error context
    });
    // Ensure a valid JSON response is always sent
    if (error instanceof Error && error.message.includes("invalid input syntax for type uuid")) { // Example of specific error check
        return apiErrorResponse("Invalid ID format encountered.", 400);
    }
    return apiErrorResponse('An internal server error occurred while fetching incoming friend requests.', 500);
  }
}
