// app/api/cabang/route.ts
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
        const limit = searchParams.get("limit") || "50";
        const search = searchParams.get("search") || "";

        const queryParams = new URLSearchParams({
            offset,
            limit,
        });

        if (search) {
            queryParams.append("search", search);
        }

        const response = await fetch(
            `${API_BASE_URL}/cabang?${queryParams.toString()}`,
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
                        responseData.message || "Failed to fetch cabang data",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        if (
            responseData.message !== "Get paginated cabang successful" ||
            !responseData.data
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "Invalid response from cabang API",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Cabang data retrieved successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Cabang API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to cabang API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching cabang data",
            },
            { status: 500 }
        );
    }
}
