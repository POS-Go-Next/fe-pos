// app/api/promo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

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

        // Only send offset and limit parameters
        const queryParams = new URLSearchParams({
            offset,
            limit,
        });

        // Remove search, sort_by, sort_order parameters

        const response = await fetch(
            `${API_BASE_URL}/promo?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: authToken.startsWith("Bearer ")
                        ? authToken
                        : `Bearer ${authToken}`,
                },
                next: { revalidate: 300 },
            }
        );

        const responseData = await response.json();if (!response.ok) {
            console.error("Promo API Error Details:", {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
            });

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
                        responseData.message || "Failed to fetch promo data",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        // Log the actual message to see what we're getting// More flexible response validation
        if (!responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "No data returned from promo API",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Promo data retrieved successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Promo API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to promo API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching promo data",
            },
            { status: 500 }
        );
    }
}
