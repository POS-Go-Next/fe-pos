// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { invalidateSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(_request: NextRequest) {
  try {
    await invalidateSession();
    
    const cookieStore = cookies();
    cookieStore.delete('auth-token');
    
    return NextResponse.json({
      success: true,
      message: "Logout successful",
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