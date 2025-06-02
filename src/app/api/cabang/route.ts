// app/api/cabang/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface CabangQueryParams {
  offset?: string;
  limit?: string;
  search?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from cookies or headers
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token')?.value || request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please login first.",
        },
        { status: 401 }
      );
    }

    // Get query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "50";
    const search = searchParams.get("search") || "";

    // Build query string for external API
    const queryParams = new URLSearchParams({
      offset,
      limit,
    });

    // Add search parameter if provided
    if (search) {
      queryParams.append("search", search);
    }

    // Call external API with authorization
    const response = await fetch(`${API_BASE_URL}/cabang?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
      },
      // Add cache settings for better performance
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    const responseData = await response.json();
    console.log("Cabang API Response:", responseData); // Debug log

    // Handle API response based on actual structure
    if (!response.ok) {
      // Handle unauthorized specifically
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "Session expired. Please login again.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to fetch cabang data",
          errors: responseData.errors,
        },
        { status: response.status }
      );
    }

    // Check if response was successful
    if (responseData.message !== "Get paginated cabang successful" || !responseData.data) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Invalid response from cabang API",
        },
        { status: 400 }
      );
    }

    // Return success response with data
    return NextResponse.json({
      success: true,
      message: "Cabang data retrieved successfully",
      data: responseData.data,
    });

  } catch (error) {
    console.error("Cabang API error:", error);

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to cabang API server",
        },
        { status: 503 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching cabang data",
      },
      { status: 500 }
    );
  }
}