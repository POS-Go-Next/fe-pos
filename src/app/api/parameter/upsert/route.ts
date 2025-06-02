// app/api/parameter/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    
    // Log the data being sent for debugging
    console.log('Parameter upsert request body:', body);

    // Call external API with authorization - CHANGED TO POST
    const response = await fetch(`${API_BASE_URL}/parameter/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });

    // Parse response
    const responseData = await response.json();
    console.log("Parameter upsert API Response:", response.status, responseData);

    // Handle API response
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

      // Handle 404 - endpoint not found
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: "Parameter upsert endpoint not found. Please check API configuration.",
          },
          { status: 404 }
        );
      }

      // Handle validation errors
      if (response.status === 422 || response.status === 400) {
        return NextResponse.json(
          {
            success: false,
            message: responseData.message || "Validation error occurred",
            errors: responseData.errors,
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to update parameter data",
          errors: responseData.errors,
        },
        { status: response.status }
      );
    }

    // Return success response - matching the expected structure
    return NextResponse.json({
      success: true,
      message: responseData.message || "Parameter updated successfully",
      data: responseData.data,
    });

  } catch (error) {
    console.error("Parameter upsert API error:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format",
        },
        { status: 400 }
      );
    }

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to parameter API server",
        },
        { status: 503 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while updating parameter data",
      },
      { status: 500 }
    );
  }
}