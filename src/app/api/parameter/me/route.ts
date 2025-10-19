// app/api/parameter/me/route.ts - FIXED VERSION
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

        // 🔥 FIX 1: Add cache-busting to external API call
        const cacheBuster = `?_t=${Date.now()}&_r=${Math.random()}`;

        const response = await fetch(
            `${API_BASE_URL}/parameter/me${cacheBuster}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: authToken.startsWith("Bearer ")
                        ? authToken
                        : `Bearer ${authToken}`,
                    // 🔥 FIX 2: Add cache control headers to external API request
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                },
                // 🔥 FIX 3: Remove Next.js caching completely
                cache: "no-store",
            }
        );

        const responseData = await response.json();
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
                        "Failed to fetch parameter data",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        if (
            responseData.message !==
                "Get parameter user logged in successful" ||
            !responseData.data
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "Invalid response from parameter API",
                },
                { status: 400 }
            );
        }

        // 🔥 FIX 4: Add strong cache control headers to response
        const headers = new Headers({
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            "Last-Modified": new Date().toUTCString(),
            ETag: `"${Date.now()}-${Math.random()}"`, // Dynamic ETag
        });

        return NextResponse.json(
            {
                success: true,
                message: "Parameter data retrieved successfully",
                data: responseData.data,
                // 🔥 FIX 5: Add timestamp to response for debugging
                timestamp: new Date().toISOString(),
            },
            { headers }
        );
    } catch (error) {
        console.error("Parameter API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to parameter API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching parameter data",
            },
            { status: 500 }
        );
    }
}
