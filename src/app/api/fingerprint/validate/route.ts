// app/api/fingerprint/validate/route.ts
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

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const { user_id, mac_address, number_of_fingerprint } = body;
    
    if (!user_id || !mac_address || !number_of_fingerprint) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: user_id, mac_address, number_of_fingerprint",
        },
        { status: 400 }
      );
    }

    // Validate number_of_fingerprint (should be 1 or 2)
    if (![1, 2].includes(number_of_fingerprint)) {
      return NextResponse.json(
        {
          success: false,
          message: "number_of_fingerprint must be 1 or 2",
        },
        { status: 400 }
      );
    }

    console.log('Fingerprint validation request:', {
      user_id,
      mac_address,
      number_of_fingerprint,
      timestamp: new Date().toISOString()
    });

    // Call external API with authorization
    const response = await fetch(`${API_BASE_URL}/fingerprint/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        user_id,
        mac_address,
        number_of_fingerprint
      }),
    });

    const responseData = await response.json();
    console.log("Fingerprint validation API Response:", responseData); // Debug log

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

      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to validate fingerprint",
          errors: responseData.errors,
        },
        { status: response.status }
      );
    }

    // Return success response with validation result
    return NextResponse.json({
      success: true,
      message: responseData.message || "Fingerprint validation completed",
      data: {
        matched: responseData.data?.matched || false
      },
    });

  } catch (error) {
    console.error("Fingerprint validation API error:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to fingerprint validation API server",
        },
        { status: 503 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during fingerprint validation",
      },
      { status: 500 }
    );
  }
}
