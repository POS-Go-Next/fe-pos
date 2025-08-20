// app/api/customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com";

// GET method (existing code)
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
        const limit = searchParams.get("limit") || "100";

        const queryParams = new URLSearchParams({
            offset,
            limit,
        });

        const response = await fetch(
            `${API_BASE_URL}/customer?${queryParams.toString()}`,
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

        const responseData = await response.json();
        console.log("Customer API Response:", responseData);
        console.log("Customer API Status:", response.status);

        if (!response.ok) {
            console.error("Customer API Error Details:", {
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
                        responseData.message || "Failed to fetch customer data",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        // Log the actual message to see what we're getting
        console.log("Customer API Success Message:", responseData.message);

        // More flexible response validation
        if (!responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "No data returned from customer API",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Customer data retrieved successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Customer API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to customer API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching customer data",
            },
            { status: 500 }
        );
    }
}

// POST method for creating customer
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

        const response = await fetch(`${API_BASE_URL}/customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: authToken.startsWith("Bearer ")
                    ? authToken
                    : `Bearer ${authToken}`,
            },
            body: JSON.stringify(body),
        });

        const responseData = await response.json();
        console.log("Create Customer API Response:", responseData);

        if (!response.ok) {
            console.error("Create Customer API Error:", {
                status: response.status,
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
                        responseData.message || "Failed to create customer",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Customer created successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Create Customer API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to customer API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred while creating customer",
            },
            { status: 500 }
        );
    }
}
