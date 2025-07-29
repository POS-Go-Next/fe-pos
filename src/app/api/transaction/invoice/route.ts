// app/api/transaction/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type {
  TransactionDetailExternalApiResponse,
  TransactionDetailApiResponse,
} from "@/types/transaction";

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

    // Get invoice_number from query parameters
    const { searchParams } = new URL(request.url);
    const invoiceNumber = searchParams.get("invoice_number");

    if (!invoiceNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice number is required",
        },
        { status: 400 }
      );
    }

    // Build API URL
    const apiUrl = `${API_BASE_URL}/transaction/invoice?invoice_number=${encodeURIComponent(
      invoiceNumber
    )}`;

    console.log("Fetching transaction detail from:", apiUrl);

    // Call external API
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`,
      },
    });

    const responseData: TransactionDetailExternalApiResponse =
      await response.json();
    console.log("Transaction Detail API Response:", {
      status: response.status,
      message: responseData.message,
      invoiceNumber: responseData.data?.invoice_number || "N/A",
      itemsCount: responseData.data?.items?.length || 0,
    });

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
          message: responseData.message || "Failed to fetch transaction detail",
        },
        { status: response.status }
      );
    }

    // Transform external API response to our format
    const transformedResponse: TransactionDetailApiResponse = {
      success: true,
      message: "Transaction detail retrieved successfully",
      data: responseData.data,
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Transaction Detail API error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to transaction detail API server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "An unexpected error occurred while fetching transaction detail",
      },
      { status: 500 }
    );
  }
}
