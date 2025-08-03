// app/api/system-info/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_SERVICE_URL = "http://localhost:8321";

interface NetworkInterface {
    name: string;
    ipAddress: string;
    macAddress: string;
    isUp: boolean;
    isLoopback: boolean;
}

interface OSInfo {
    platform: string;
    architecture: string;
    numCPU: number;
}

interface SystemInfoData {
    hostname: string;
    ipAddresses: NetworkInterface[];
    macAddresses: string[];
    osInfo: OSInfo;
    workingDir: string;
    timestamp: string;
}

interface SystemInfoResponse {
    success: boolean;
    data: SystemInfoData;
}

export async function GET(request: NextRequest) {
    try {
        console.log(
            "Fetching system info from:",
            `${SYSTEM_SERVICE_URL}/system-info`
        );

        const response = await fetch(`${SYSTEM_SERVICE_URL}/system-info`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 seconds timeout
        });

        if (!response.ok) {
            console.error(
                "System service response not ok:",
                response.status,
                response.statusText
            );

            return NextResponse.json(
                {
                    success: false,
                    message: `System service returned ${response.status}: ${response.statusText}`,
                },
                { status: response.status }
            );
        }

        const responseData: SystemInfoResponse = await response.json();
        console.log("System info response:", responseData);

        if (!responseData.success || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response from system service",
                },
                { status: 400 }
            );
        }

        // Validate required fields
        if (
            !responseData.data.ipAddresses ||
            !Array.isArray(responseData.data.ipAddresses)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid system info data: missing ipAddresses",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: responseData.data,
        });
    } catch (error) {
        console.error("System info fetch error:", error);

        // Handle specific error types
        if (error instanceof Error) {
            if (
                error.name === "AbortError" ||
                error.message.includes("timeout")
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "System service request timed out. Please ensure the service is running on port 8321.",
                    },
                    { status: 408 }
                );
            }

            if (
                error.message.includes("ECONNREFUSED") ||
                error.message.includes("fetch")
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Cannot connect to system service. Please ensure the service is running on localhost:8321.",
                    },
                    { status: 503 }
                );
            }

            if (error instanceof SyntaxError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid response format from system service.",
                    },
                    { status: 502 }
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching system information.",
            },
            { status: 500 }
        );
    }
}
