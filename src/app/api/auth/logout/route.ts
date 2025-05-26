// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Invalidate the session
    await invalidateSession();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during logout",
      },
      { status: 500 }
    );
  }
}