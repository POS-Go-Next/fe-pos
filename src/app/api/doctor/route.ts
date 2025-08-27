// app/api/doctor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "http://localhost:8081/api";

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
        const search = searchParams.get("search") || "";
        const sort_by = searchParams.get("sort_by") || "id";
        const sort_order = searchParams.get("sort_order") || "desc";

        const queryParams = new URLSearchParams({
            offset,
            limit,
            sort_by,
            sort_order,
        });

        if (search) {
            queryParams.append("search", search);
        }

        const response = await fetch(
            `${API_BASE_URL}/doctor?${queryParams.toString()}`,
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
        console.log("Doctor API Response:", responseData);

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
                        responseData.message || "Failed to fetch doctor data",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        if (
            responseData.message !== "Get paginated doctors successful" ||
            !responseData.data
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        responseData.message ||
                        "Invalid response from doctor API",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Doctor data retrieved successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Doctor API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to doctor API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching doctor data",
            },
            { status: 500 }
        );
    }
}

// POST method for creating doctor
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

        const response = await fetch(`${API_BASE_URL}/doctor`, {
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
        console.log("Create Doctor API Response:", responseData);

        if (!response.ok) {
            console.error("Create Doctor API Error:", {
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
                    message: responseData.message || "Failed to create doctor",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Doctor created successfully",
            data: responseData.data,
        });
    } catch (error) {
        console.error("Create Doctor API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to doctor API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred while creating doctor",
            },
            { status: 500 }
        );
    }
}
