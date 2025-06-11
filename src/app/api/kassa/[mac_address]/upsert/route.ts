// app/api/kassa/[mac_address]/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface KassaUpsertData {
  antrian: boolean;
  status_aktif: boolean;
  finger: 'Y' | 'N';
  default_jual: string;
  ip_address: string;
  mac_address: string;
}

interface KassaResponse {
  id_kassa: number;
  kd_cab: string;
  no_kassa: number;
  type_jual: string;
  antrian: boolean;
  status_aktif: boolean;
  status_operasional: string;
  user_operasional: number;
  tanggal_update: string;
  user_update: string;
  status: string;
  finger: string;
  default_jual: string;
  mac_address: string;
  is_deleted: number;
  deleted_at: string;
  ip_address: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { mac_address: string } }
) {
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

    // Get MAC address from URL params
    const macAddress = params.mac_address;
    
    if (!macAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "MAC address is required",
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: KassaUpsertData = await request.json();
    
    // Validate required fields
    if (
      typeof body.antrian !== 'boolean' ||
      typeof body.status_aktif !== 'boolean' ||
      !['Y', 'N'].includes(body.finger) ||
      !body.default_jual ||
      !body.ip_address ||
      !body.mac_address
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data. Please check all required fields.",
        },
        { status: 400 }
      );
    }

    console.log('Kassa upsert request:', {
      macAddress,
      body,
      timestamp: new Date().toISOString()
    });

    // Call external API
    const response = await fetch(`${API_BASE_URL}/kassa/${macAddress}/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        antrian: body.antrian,
        status_aktif: body.status_aktif,
        finger: body.finger,
        default_jual: body.default_jual,
        ip_address: body.ip_address,
        mac_address: body.mac_address,
      }),
    });

    const responseData = await response.json();
    console.log("Kassa API Response:", responseData);

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
          message: responseData.message || "Failed to update kassa setup",
          errors: responseData.errors,
        },
        { status: response.status }
      );
    }

    // Check if response has expected structure
    if (!responseData.message || !responseData.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from kassa API",
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: responseData.message,
      data: responseData.data,
    });

  } catch (error) {
    console.error("Kassa upsert error:", error);

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to kassa API server",
        },
        { status: 503 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Please check your data.",
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while updating kassa setup",
      },
      { status: 500 }
    );
  }
}