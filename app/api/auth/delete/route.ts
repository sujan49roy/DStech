import { type NextRequest, NextResponse } from "next/server";
import { deleteUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteUser(userId);

    // The deleteUser function in lib/auth.ts already handles cookie deletion
    // So, no need to explicitly delete it here again.

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}