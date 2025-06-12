import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { type User } from "@/lib/models"; // Changed import
import { logger } from '@/lib/logger';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      logger.warn('API: Remove friend - Unauthorized access attempt.');
      return apiErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { friendUserId } = body;

    if (!friendUserId) {
      logger.warn('API: Remove friend - Missing friendUserId.');
      return apiErrorResponse('friendUserId is required.', 400);
    }

    if (!ObjectId.isValid(friendUserId)) {
      logger.warn(`API: Remove friend - Invalid friendUserId format: ${friendUserId}`);
      return apiErrorResponse('Invalid friendUserId format.', 400);
    }

    const friendObjectId = new ObjectId(friendUserId);
    const currentUserObjectId = new ObjectId(currentUser.id);

    if (currentUserObjectId.equals(friendObjectId)) {
      logger.warn(`API: Remove friend - User ${currentUser.id} attempting to remove self.`);
      return apiErrorResponse('You cannot remove yourself as a friend.', 400);
    }

    const db = await connectToDB(); // Make sure db is available
    const usersCollection = db.collection<User>("users");

    // Update current user: remove friendUserId from friends array
    const updateCurrentUser = await usersCollection.updateOne(
      { _id: currentUserObjectId },
      { $pull: { friends: friendObjectId } }
    );

    // Update friend user: remove current user's ID from friends array
    const updateFriendUser = await usersCollection.updateOne(
      { _id: friendObjectId },
      { $pull: { friends: currentUserObjectId } }
    );

    // Check if the friend was actually removed from at least one list,
    // though $pull won't error if the element wasn't present.
    if (updateCurrentUser.modifiedCount === 0 && updateFriendUser.modifiedCount === 0) {
      // This might happen if they weren't friends to begin with, or already removed.
      // Depending on desired strictness, could be an info log or even a soft error/specific message.
      logger.info(`API: Remove friend - No changes made for user ${currentUser.id} and friend ${friendUserId}. They might not have been friends or already removed.`);
      // Still, returning success as the state (not friends) is achieved.
    } else {
      logger.info(`API: User ${currentUser.id} removed friend ${friendUserId}. CurrentUser update: ${updateCurrentUser.modifiedCount}, FriendUser update: ${updateFriendUser.modifiedCount}`);
    }

    return apiSuccessResponse({ message: 'Friend removed successfully.' }, 200);

  } catch (error) {
    logger.error('API: Error removing friend:', error);
    if (error instanceof Error) {
        return apiErrorResponse(error.message, 500);
    }
    return apiErrorResponse('An unknown error occurred while removing the friend.', 500);
  }
}
