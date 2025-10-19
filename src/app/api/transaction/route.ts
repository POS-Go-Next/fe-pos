// app/api/transaction/route.ts - UPDATED WITH PRODUCT CODE FILTER
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type {
  TransactionExternalApiResponse,
} from "@/types/transaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

// POST method for creating new transactions (EXISTING CODE)
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

    // Get request body
    const body = await request.json();// Validate required fields
    if (!body.device_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Device ID is required",
        },
        { status: 400 }
      );
    }

    if (!body.invoice_number) {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice number is required",
        },
        { status: 400 }
      );
    }

    if (!body.customer_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer ID is required",
        },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction items are required",
        },
        { status: 400 }
      );
    }

    // Call external API
    const response = await fetch(`${API_BASE_URL}/transaction`, {
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

    const responseData = await response.json();if (!response.ok) {
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
          message: responseData.message || "Failed to create transaction",
          errors: responseData.errors,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction created successfully",
      data: responseData.data,
    });
  } catch (error) {
    console.error("❌ Transaction Creation API error:", error);

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
        message: "An unexpected error occurred while creating transaction",
      },
      { status: 500 }
    );
  }
}

// GET method for transaction list - UPDATED WITH PRODUCT CODE FILTER
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
    const dateGte = searchParams.get("date_gte") || "";
    const dateLte = searchParams.get("date_lte") || "";
    const boughtProductCode = searchParams.get("bought_product_code") || "";
    const search = searchParams.get("search") || "";

    // Validate offset to prevent excessive values
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
    if (dateGte) apiUrl.searchParams.set("date_gte", dateGte);
    if (dateLte) apiUrl.searchParams.set("date_lte", dateLte);
    if (boughtProductCode)
      apiUrl.searchParams.set("bought_product_code", boughtProductCode);
    if (search) apiUrl.searchParams.set("search", search);// Call external API with timeout
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
          {
            success: false,
            message: "Session expired. Please login again.",
          },
          { status: 401 }
        );
      }
      // Return 400 for client errors instead of propagating 503
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

    const responseData: TransactionExternalApiResponse = await response.json();return NextResponse.json({
      success: true,
      message: "Transactions retrieved successfully",
      data: responseData.data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Transaction API error:", errorMessage);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, message: "Request timeout" },
        { status: 504 }
      );
    }

    if (error instanceof Error && error.message?.includes("fetch")) {
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
