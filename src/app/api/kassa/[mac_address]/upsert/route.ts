// app/api/kassa/[mac_address]/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface KassaUpsertData {
    default_jual: string;
    status_aktif: boolean;
    antrian: boolean;
    finger: string;
    ip_address: string;
    mac_address: string;
    printer_id: number | null;
}

interface KassaResponse {
    id_kassa: number;
    kd_cab: string;
    no_kassa: number;
    type_jual: string;
    antrian: boolean;
    status_aktif: boolean;
    status_operasional: string;
    user_operasional: number;
    tanggal_update: string;
    user_update: string;
    status: string;
    finger: string;
    default_jual: string;
    mac_address: string;
    is_deleted: number;
    deleted_at: string;
    ip_address: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { mac_address: string } }
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

        const macAddress = params.mac_address;

        if (!macAddress) {
            return NextResponse.json(
                {
                    success: false,
                    message: "MAC address is required",
                },
                { status: 400 }
            );
        }

        const body: KassaUpsertData = await request.json();

        console.log("📥 Received request body:", body);
        console.log("📥 Body types:", {
            default_jual: typeof body.default_jual,
            status_aktif: typeof body.status_aktif,
            antrian: typeof body.antrian,
            finger: typeof body.finger,
            ip_address: typeof body.ip_address,
            mac_address: typeof body.mac_address,
            printer_id: typeof body.printer_id,
        });

        // Convert string values to proper types
        const processedBody = {
            default_jual: body.default_jual,
            status_aktif: Boolean(body.status_aktif),
            antrian: Boolean(body.antrian),
            finger: body.finger,
            ip_address: body.ip_address,
            mac_address: body.mac_address,
            printer_id: body.printer_id ? Number(body.printer_id) : null,
        };

        console.log("Processed body for API:", processedBody);

        if (
            !processedBody.default_jual ||
            typeof processedBody.status_aktif !== "boolean" ||
            typeof processedBody.antrian !== "boolean" ||
            !processedBody.finger ||
            !processedBody.ip_address ||
            !processedBody.mac_address ||
            (processedBody.printer_id !== null &&
                typeof processedBody.printer_id !== "number")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid request data. Please check all required fields.",
                    debug: {
                        received: body,
                        processed: processedBody,
                    },
                },
                { status: 400 }
            );
        }

        console.log("Kassa upsert request:", {
            macAddress,
            body: processedBody,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(
            `${API_BASE_URL}/kassa/${macAddress}/upsert`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: authToken.startsWith("Bearer ")
                        ? authToken
                        : `Bearer ${authToken}`,
                },
                body: JSON.stringify(processedBody),
            }
        );

        const responseData = await response.json();
        console.log("Kassa API Response:", responseData);

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
                        responseData.message || "Failed to update kassa setup",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        if (!responseData.message || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response from kassa API",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: responseData.message,
            data: responseData.data,
        });
    } catch (error) {
        console.error("Kassa upsert error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to kassa API server",
                },
                { status: 503 }
            );
        }

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request format. Please check your data.",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while updating kassa setup",
            },
            { status: 500 }
        );
    }
}
