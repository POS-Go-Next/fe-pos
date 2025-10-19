// app/api/cashier-activity/[device_id]/reclose/[kode]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface RecloseActivityResponse {
  kode: string;
  tanggal: string;
  tgl_trans: string;
  kd_kasir: string;
  kd_kassa: string;
  shift: string;
  tanggal_opening: string;
  jam_opening: string;
  tanggal_closing: string;
  jam_closing: string;
  status_operasional: string;
  user_update: string;
  status: string;
  tot_setor: number;
}

interface RecloseActivityExternalApiResponse {
  message: string;
  data: RecloseActivityResponse;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { device_id: string; kode: string } }
) {
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

    const deviceId = params.device_id;
    const kode = params.kode;

    if (!deviceId || !kode) {
      return NextResponse.json(
        {
          success: false,
          message: "Device ID and kode are required",
        },
        { status: 400 }
      );
    }
    const response = await fetch(
      `${API_BASE_URL}/cashier-activity/${deviceId}/reclose/${kode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authToken.startsWith("Bearer ")
            ? authToken
            : `Bearer ${authToken}`,
        },
      }
    );

    const responseData: RecloseActivityExternalApiResponse =
      await response.json();

    if (!response.ok) {
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
          {
            success: false,
            message: "Cashier activity not found for reclose",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Failed to reclose cashier activity",
        },
        { status: response.status }
      );
    }

    if (!responseData.message || !responseData.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from reclose activity API",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.message,
      data: responseData.data,
    });
  } catch (error) {
    console.error("Reclose activity error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to reclose activity API server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "An unexpected error occurred while reclosing cashier activity",
      },
      { status: 500 }
    );
  }
}
