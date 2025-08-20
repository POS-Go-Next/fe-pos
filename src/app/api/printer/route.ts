// app/api/printer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com";

interface PrinterData {
    id: number;
    nm_printer: string;
    status: boolean;
}

interface PrinterPaginationData {
    docs: PrinterData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

interface PrinterApiResponse {
    message: string;
    data: PrinterPaginationData;
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
        const offset = searchParams.get("offset") || "0";
        const limit = searchParams.get("limit") || "10";

        // Validate query parameters
        const offsetNum = parseInt(offset);
        const limitNum = parseInt(limit);

        if (isNaN(offsetNum) || offsetNum < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid offset parameter",
                },
                { status: 400 }
            );
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid limit parameter (must be between 1-100)",
                },
                { status: 400 }
            );
        }

        console.log("Fetching printers:", {
            offset: offsetNum,
            limit: limitNum,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(
            `${API_BASE_URL}/printer?offset=${offsetNum}&limit=${limitNum}`,
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

        const responseData: PrinterApiResponse = await response.json();
        console.log("Printer API Response:", responseData);

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

            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message || "Failed to fetch printer data",
                },
                { status: response.status }
            );
        }

        if (!responseData.message || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response from printer API",
                },
                { status: 400 }
            );
        }

        // Validate response data structure
        if (!Array.isArray(responseData.data.docs)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid printer data format",
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
        console.error("Printer fetch error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to printer API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching printer data",
            },
            { status: 500 }
        );
    }
}
