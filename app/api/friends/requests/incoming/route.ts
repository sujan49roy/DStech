import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth'; // Assuming this utility exists and works
import { connectToDB } from '@/lib/db'; // Assuming this utility exists
import User from '@/lib/models/User'; // Assuming User model path
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

    const userWithRequests = await User.findById(currentUser.id)
      .select('incomingRequests')
      .lean(); // Use lean for performance if not modifying

    if (!userWithRequests || !userWithRequests.incomingRequests || userWithRequests.incomingRequests.length === 0) {
      return apiSuccessResponse([], 200);
    }

    const incomingRequestUserIds = userWithRequests.incomingRequests;

    // Fetch details for each user in incomingRequests
    // Fields consistent with SearchUser: id (as _id), username, ghUsername
    // Also fetching 'name' as it's mentioned in the prompt as a potential field
    const requesters = await User.find({
      _id: { $in: incomingRequestUserIds },
    })
    .select('_id username name ghUsername email') // Added email as per prompt
    .lean();

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
