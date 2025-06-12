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

    if (!userWithRequests || !userWithRequests.incomingRequests || userWithRequests.incomingRequests.length === 0) {
      return apiSuccessResponse([], 200);
    }

    // Ensure incomingRequestUserIds are ObjectIds for the $in query if they are not already
    // Assuming User model stores them as ObjectId, and lean might convert them to strings or keep as ObjectId
    // For safety, we map them to ObjectId. If they are already ObjectIds, new ObjectId(id) handles it.
    const incomingRequestUserIds = userWithRequests.incomingRequests.map(id => new ObjectId(id.toString()));


    // Fetch details for each user in incomingRequests
    const requesters = await usersCollection.find(
        { _id: { $in: incomingRequestUserIds } }
    )
    .project({ _id: 1, username: 1, name: 1, ghUsername: 1, email: 1 })
    .toArray();

    // Map _id to id for consistency with frontend SearchUser interface
    const formattedRequesters = requesters.map(user => ({
      ...user,
      id: user._id.toString(),
      // _id: undefined, // Optionally remove original _id if not needed
    }));

    logger.info(`API: User ${currentUser.id} fetched ${formattedRequesters.length} incoming friend requests.`);
    return apiSuccessResponse(formattedRequesters, 200);

  } catch (error) {
    logger.error('API: Error fetching incoming friend requests:', error);
    if (error instanceof Error) {
        return apiErrorResponse(error.message, 500);
    }
    return apiErrorResponse('An unknown error occurred while fetching incoming friend requests.', 500);
  }
}
