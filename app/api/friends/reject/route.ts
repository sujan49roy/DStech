import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/lib/models/User';
import { logger } from '@/lib/logger';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/utils'; // Assuming apiSuccessResponse exists

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      logger.warn('API: Reject friend request - Unauthorized access attempt.');
      return apiErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { requesterUserId } = body;

    if (!requesterUserId) {
      logger.warn('API: Reject friend request - Missing requesterUserId.');
      return apiErrorResponse('requesterUserId is required.', 400);
    }

    if (!ObjectId.isValid(requesterUserId)) {
      logger.warn(`API: Reject friend request - Invalid requesterUserId format: ${requesterUserId}`);
      return apiErrorResponse('Invalid requesterUserId format.', 400);
    }

    if (currentUser.id.toString() === requesterUserId) {
        logger.warn(`API: Reject friend request - User ${currentUser.id} attempting to reject own request (scenario unlikely).`);
        return apiErrorResponse('Cannot reject a request from yourself.', 400);
    }

    const requesterObjectId = new ObjectId(requesterUserId);
    const currentUserObjectId = new ObjectId(currentUser.id); // Assuming currentUser.id is a string

    // Update current user: remove requesterUserId from incomingRequests
    const updateCurrentUser = await User.updateOne(
      { _id: currentUserObjectId },
      { $pull: { incomingRequests: requesterObjectId } }
    );

    // Update requester user: remove current user's ID from outgoingRequests
    const updateRequesterUser = await User.updateOne(
      { _id: requesterObjectId },
      { $pull: { outgoingRequests: currentUserObjectId } }
    );

    // Logging the outcome, not strictly necessary to check modifiedCount for $pull
    // as it's not an error if the ID wasn't there to begin with.
    logger.info(`API: User ${currentUser.id} rejected friend request from ${requesterUserId}. CurrentUser update: ${updateCurrentUser.modifiedCount}, RequesterUser update: ${updateRequesterUser.modifiedCount}`);

    return apiSuccessResponse({ message: 'Friend request rejected successfully.' }, 200);

  } catch (error) {
    logger.error('API: Error rejecting friend request:', error);
    if (error instanceof Error) {
        return apiErrorResponse(error.message, 500);
    }
    return apiErrorResponse('An unknown error occurred while rejecting the friend request.', 500);
  }
}
