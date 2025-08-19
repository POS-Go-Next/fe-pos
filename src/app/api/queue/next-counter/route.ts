// app/api/queue/next-counter/route.ts
import { NextRequest, NextResponse } from "next/server";

interface QueueApiResponse {
    message: string;
    data: {
        queue_number: number;
    };
}

export async function GET(request: NextRequest) {
    try {
        // Get auth token from cookies
        const authToken = request.cookies.get("auth-token")?.value;

        if (!authToken) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        console.log("🔄 Fetching next queue counter");

        // Call external API
        const response = await fetch(
            "http://localhost:8081/api/queue/next-counter",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const data: QueueApiResponse = await response.json();

        console.log(`📡 Queue API Response:`, {
            status: response.status,
            message: data.message,
            queueNumber: data.data?.queue_number,
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Failed to fetch queue counter" },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("❌ Queue API Error:", error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
