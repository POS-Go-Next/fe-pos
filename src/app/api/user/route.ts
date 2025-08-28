// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();

        let authToken =
            request.headers.get("authorization") ||
            cookieStore.get("auth-token")?.value ||
            cookieStore.get("user-data")?.value;

        if (authToken?.startsWith("Bearer ")) {
            authToken = authToken.substring(7);
        }

        console.log("🔐 Auth check:", {
            hasHeaderAuth: !!request.headers.get("authorization"),
            hasCookieAuth: !!cookieStore.get("auth-token")?.value,
            tokenLength: authToken?.length || 0,
            tokenPrefix: authToken?.substring(0, 10) || "none",
        });

        if (!authToken || authToken === "null" || authToken === "undefined") {
            console.log("❌ No valid auth token found");
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

        console.log("📤 Making request to external API:", {
            url: `${API_BASE_URL}/user?${queryParams.toString()}`,
            hasAuthToken: !!authToken,
        });

        const response = await fetch(
            `${API_BASE_URL}/user?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const responseData = await response.json();
        console.log("📥 User API Response:", {
            status: response.status,
            ok: response.ok,
            message: responseData.message,
            hasData: !!responseData.data,
            dataLength: responseData.data?.docs?.length || 0,
        });

        if (!response.ok) {
            console.log(
                "❌ External API error:",
                response.status,
                responseData.message
            );

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
                        responseData.message || "Failed to fetch user data",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        if (
            responseData.message !== "Get paginated user successful" ||
            !responseData.data
        ) {
            console.log("❌ Invalid response structure:", responseData.message);
            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "Invalid response from user API",
                },
                { status: 400 }
            );
        }

        console.log("✅ User data retrieved successfully:", {
            totalDocs: responseData.data.totalDocs,
            docsCount: responseData.data.docs?.length,
            page: responseData.data.page,
            totalPages: responseData.data.totalPages,
        });

        return NextResponse.json({
            success: true,
            message: "User data retrieved successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("❌ User API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to user API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching user data",
            },
            { status: 500 }
        );
    }
}
