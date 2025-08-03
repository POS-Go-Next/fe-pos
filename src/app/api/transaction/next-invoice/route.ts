// app/api/transaction/next-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

interface InvoiceApiResponse {
    message: string;
    data: {
        invoice_number: string;
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

        // Get transaction_type from query params
        const { searchParams } = new URL(request.url);
        const transactionType = searchParams.get("transaction_type") || "1";

        console.log(
            `🔄 Fetching next invoice number for transaction_type: ${transactionType}`
        );

        // Call external API
        const response = await fetch(
            `https://api-pos.masivaguna.com/api/transaction/next-invoice?transaction_type=${transactionType}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );

        const data: InvoiceApiResponse = await response.json();

        console.log(`📡 Invoice API Response:`, {
            status: response.status,
            message: data.message,
            invoiceNumber: data.data?.invoice_number,
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    message:
                        data.message || "Failed to fetch next invoice number",
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("❌ Invoice API Error:", error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
