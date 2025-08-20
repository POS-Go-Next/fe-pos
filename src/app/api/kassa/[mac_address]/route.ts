// app/api/kassa/[mac_address]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com";

interface KassaResponse {
    id_kassa: number;
    kd_cab: string;
    no_kassa: number;
    type_jual: string;
    antrian: boolean;
    status_aktif: boolean;
    status_operasional: string;
    tanggal_update: string;
    user_update: string;
    status: string;
    finger: string;
    default_jual: string;
    ip_address: string;
    mac_address: string;
    printer_id?: number;
    printer?: {
        id: number;
        nm_printer: string;
        status: boolean;
    };
}

interface KassaExternalApiResponse {
    message: string;
    data: KassaResponse;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { mac_address: string } }
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

        console.log("Fetching kassa data for MAC:", {
            macAddress,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(`${API_BASE_URL}/kassa/${macAddress}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authToken.startsWith("Bearer ")
                    ? authToken
                    : `Bearer ${authToken}`,
            },
        });

        const responseData: KassaExternalApiResponse = await response.json();
        console.log("Kassa API Response:", responseData);

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
                        message: "Kassa not found for this MAC address",
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message || "Failed to fetch kassa data",
                },
                { status: response.status }
            );
        }

        if (!responseData.message || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response from kassa API",
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
        console.error("Kassa fetch error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to kassa API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching kassa data",
            },
            { status: 500 }
        );
    }
}
