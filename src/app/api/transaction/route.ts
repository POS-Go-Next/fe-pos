// app/api/transaction/route.ts - SIMPLE VERSION

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
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const fromDate = searchParams.get("from_date") || "";
    const toDate = searchParams.get("to_date") || "";

    // FIXED: Validate offset to prevent excessive values
    if (offset < 0 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Build API URL
    const apiUrl = new URL(`${API_BASE_URL}/transaction`);
    apiUrl.searchParams.set("offset", offset.toString());
    apiUrl.searchParams.set("limit", limit.toString());
    if (fromDate) apiUrl.searchParams.set("from_date", fromDate);
    if (toDate) apiUrl.searchParams.set("to_date", toDate);

    console.log("API URL:", apiUrl.toString());

    // Call external API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("External API error:", response.status);
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, message: "Session expired. Please login again." },
          { status: 401 }
        );
      }
      // FIXED: Return 400 for client errors instead of propagating 503
      if (response.status >= 400 && response.status < 500) {
        return NextResponse.json(
          { success: false, message: "Invalid request parameters" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Failed to fetch transactions" },
        { status: response.status }
      );
    }

    const responseData: TransactionExternalApiResponse = await response.json();
    console.log(
      "Success:",
      responseData.data?.docs?.length || 0,
      "transactions"
    );

    return NextResponse.json({
      success: true,
      message: "Transactions retrieved successfully",
      data: responseData.data,
    });
  } catch (error: any) {
    console.error("Transaction API error:", error.message);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { success: false, message: "Request timeout" },
        { status: 504 }
      );
    }

    if (error.message?.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to transaction API server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
