// app/api/cashier-activity/[device_id]/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface CashierData {
    id: number;
    fullname: string;
    username: string;
    email: string;
    phone: string;
    role_id: number;
}

interface CashierActivityResponse {
    kode: string;
    tanggal: string;
    tgl_trans: string;
    kd_kasir: string;
    kd_kassa: string;
    shift: string;
    tanggal_opening: string;
    jam_opening: string;
    tanggal_closing?: string;
    jam_closing?: string;
    status_operasional: string;
    user_update?: string;
    status: string;
    tot_setor: number;
    cashier: CashierData;
}

interface CashierActivityExternalApiResponse {
    message: string;
    data: CashierActivityResponse;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { device_id: string } }
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

        if (!deviceId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Device ID is required",
                },
                { status: 400 }
            );
        }

        console.log("Fetching cashier activity for device ID:", {
            deviceId,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(
            `${API_BASE_URL}/cashier-activity/${deviceId}/active`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: authToken.startsWith("Bearer ")
                        ? authToken
                        : `Bearer ${authToken}`,
                },
            }
        );

        const responseData: CashierActivityExternalApiResponse =
            await response.json();
        console.log("Cashier Activity API Response:", responseData);

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
                        message:
                            "No active cashier activity found for this device ID",
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "Failed to fetch cashier activity",
                },
                { status: response.status }
            );
        }

        if (!responseData.message || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response from cashier activity API",
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
        console.error("Cashier activity fetch error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to cashier activity API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching cashier activity",
            },
            { status: 500 }
        );
    }
}
