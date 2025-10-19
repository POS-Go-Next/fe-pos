// app/api/cashier-activities/route.ts
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
    position_id?: number;
}

interface CashierActivityItem {
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

interface CashierActivitiesListData {
    docs: CashierActivityItem[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

interface CashierActivitiesExternalApiResponse {
    message: string;
    data: CashierActivitiesListData;
}

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

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit") || "10";
        const offset = searchParams.get("offset") || "0";const response = await fetch(
            `${API_BASE_URL}/cashier-activity?limit=${limit}&offset=${offset}`,
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

        const responseData: CashierActivitiesExternalApiResponse =
            await response.json();if (!response.ok) {
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
                    message:
                        responseData.message ||
                        "Failed to fetch cashier activities list",
                },
                { status: response.status }
            );
        }

        if (!responseData.message || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid response from cashier activities list API",
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
        console.error("Cashier activities list fetch error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unable to connect to cashier activities list API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching cashier activities list",
            },
            { status: 500 }
        );
    }
}
