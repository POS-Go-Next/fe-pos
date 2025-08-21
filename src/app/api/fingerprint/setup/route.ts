// app/api/fingerprint/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

export async function POST(request: NextRequest) {
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

        const body = await request.json();

        const { user_id, mac_address, number_of_fingerprint } = body;

        if (!user_id || !mac_address || !number_of_fingerprint) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: user_id, mac_address, number_of_fingerprint",
                },
                { status: 400 }
            );
        }

        if (![1, 2].includes(number_of_fingerprint)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "number_of_fingerprint must be 1 or 2",
                },
                { status: 400 }
            );
        }

        console.log("Fingerprint setup request:", {
            user_id,
            mac_address,
            number_of_fingerprint,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(`${API_BASE_URL}/fingerprint/setup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authToken.startsWith("Bearer ")
                    ? authToken
                    : `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                user_id,
                mac_address,
                number_of_fingerprint,
            }),
        });

        const responseData = await response.json();
        console.log("Fingerprint setup API Response:", responseData);

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
                        responseData.message || "Failed to setup fingerprint",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Fingerprint setup completed successfully",
            data: responseData,
        });
    } catch (error) {
        console.error("Fingerprint setup API error:", error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON in request body",
                },
                { status: 400 }
            );
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to fingerprint API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred during fingerprint setup",
            },
            { status: 500 }
        );
    }
}
