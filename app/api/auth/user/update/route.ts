import { type NextRequest, NextResponse } from "next/server";
import { updateUser, getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";
import type { User } from "@/lib/models";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionUser = await getCurrentUser(); // Use getCurrentUser to ensure user is authenticated

    if (!sessionUser || !sessionUser._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionUser._id.toString();
    const userDataToUpdate = await request.json() as Partial<Omit<User, "_id" | "createdAt" | "password">>;

    // Basic validation for what can be updated
    if (!userDataToUpdate.name && !userDataToUpdate.email) {
      return NextResponse.json({ error: "No update data provided (name or email required)" }, { status: 400 });
    }
    
    // Filter out any attempt to update password or other restricted fields via this route
    const allowedUpdates: Partial<Omit<User, "_id" | "createdAt" | "password">> = {};
    if (userDataToUpdate.name) allowedUpdates.name = userDataToUpdate.name;
    if (userDataToUpdate.email) allowedUpdates.email = userDataToUpdate.email;


    if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid update data provided" }, { status: 400 });
    }

    const updatedUser = await updateUser(userId, allowedUpdates);
    
    // Return the updated user without the password
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user details" },
      { status: 500 }
    );
  }
}