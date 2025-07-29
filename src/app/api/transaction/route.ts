// app/api/transaction/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type {
  TransactionExternalApiResponse,
  TransactionApiResponse,
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get("offset") || "0";
    const limit = searchParams.get("limit") || "10";
    const fromDate = searchParams.get("from_date") || "";
    const toDate = searchParams.get("to_date") || "";

    // Build API URL with parameters
    const apiUrl = new URL(`${API_BASE_URL}/transaction`);
    apiUrl.searchParams.set("offset", offset);
    apiUrl.searchParams.set("limit", limit);

    if (fromDate) {
      apiUrl.searchParams.set("from_date", fromDate);
    }
    if (toDate) {
      apiUrl.searchParams.set("to_date", toDate);
    }

    console.log("Fetching transactions from:", apiUrl.toString());

    // Call external API
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`,
      },
    });

    const responseData: TransactionExternalApiResponse = await response.json();
    console.log("Transaction API Response:", {
      status: response.status,
      message: responseData.message,
      dataCount: responseData.data?.docs?.length || 0,
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
          message: responseData.message || "Failed to fetch transactions",
        },
        { status: response.status }
      );
    }

    // Transform external API response to our format
    const transformedResponse: TransactionApiResponse = {
      success: true,
      message: "Transactions retrieved successfully",
      data: responseData.data,
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Transaction API error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to transaction API server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching transactions",
      },
      { status: 500 }
    );
  }
}
