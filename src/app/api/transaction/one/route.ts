import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken =
      cookieStore.get("auth-token")?.value ||
      request.headers.get("authorization");

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please login first.",
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Call external API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

     const response = await fetch(`${API_BASE_URL}/transaction/one?id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("External API error:", response.status);
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "Session expired. Please login again.",
          },
          { status: 401 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: "Transaction not found" },
          { status: 404 }
        );
      }
      if (response.status >= 400 && response.status < 500) {
        return NextResponse.json(
          { success: false, message: "Invalid request parameters" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Failed to fetch transaction" },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json({
      success: true,
      message: "Transaction retrieved successfully",
      data: responseData.data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Transaction API error:", errorMessage);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, message: "Request timeout" },
        { status: 504 }
      );
    }

    if (error instanceof Error && error.message?.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to transaction API server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
