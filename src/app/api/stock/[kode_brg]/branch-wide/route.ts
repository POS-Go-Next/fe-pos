// app/api/stock/[kode_brg]/branch-wide/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "http://localhost:8081/api";

export async function GET(
    request: NextRequest,
    { params }: { params: { kode_brg: string } }
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

        // Call external API with stock details
        const response = await fetch(
            `${API_BASE_URL}/stock/${params.kode_brg}?with_stock_details=true`,
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

        const responseData = await response.json();
        console.log("Branch wide stock API Response:", responseData);

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
                        responseData.message ||
                        "Failed to fetch branch wide stock",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Branch wide stock retrieved successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Branch wide stock API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unable to connect to branch wide stock API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching branch wide stock",
            },
            { status: 500 }
        );
    }
}
