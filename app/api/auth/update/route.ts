import { type NextRequest, NextResponse } from "next/server";
import { updateUserPassword } from "@/lib/auth"; // adjust import if needed
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Get userId from cookie
    const cookieStore = cookies();
    const userId = (await cookieStore).get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update password
    const result = await updateUserPassword(userId, currentPassword, newPassword);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update password" },
      { status: 500 }
    );
  }
}
