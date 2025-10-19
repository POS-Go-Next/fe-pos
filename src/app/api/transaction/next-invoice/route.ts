import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface InvoiceApiResponse {
    message: string;
    data: {
        invoice_number: string;
    };
}

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
        const transactionType = searchParams.get("transaction_type") || "1";


        const response = await fetch(
            `${API_BASE_URL}/transaction/next-invoice?transaction_type=${transactionType}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: authToken.startsWith("Bearer ")
                        ? authToken
                        : `Bearer ${authToken}`,
                },
                next: { revalidate: 0 },
            }
        );

        const data: InvoiceApiResponse = await response.json();
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
                        data.message || "Failed to fetch next invoice number",
                },
                { status: response.status }
            );
        }

        if (!data.data || !data.data.invoice_number) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid response from invoice API",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Next invoice number retrieved successfully",
            data: data.data,
        });
    } catch (error) {
        console.error("❌ Invoice API Error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to invoice API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching next invoice number",
            },
            { status: 500 }
        );
    }
}
