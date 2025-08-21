// app/api/stock/[kode_brg]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

export async function GET(
    request: NextRequest,
    { params }: { params: { kode_brg: string } }
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const withInfoObat = searchParams.get("with_info_obat") || "false";
        const withProductImages =
            searchParams.get("with_product_images") || "false";

        // Build query string for external API
        const queryParams = new URLSearchParams();
        if (withInfoObat === "true") {
            queryParams.append("with_info_obat", "true");
        }
        if (withProductImages === "true") {
            queryParams.append("with_product_images", "true");
        }

        // Call external API
        const response = await fetch(
            `${API_BASE_URL}/stock/${
                params.kode_brg
            }?${queryParams.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: authToken.startsWith("Bearer ")
                        ? authToken
                        : `Bearer ${authToken}`,
                },
            }
        );

        const responseData = await response.json();

        // Enhanced logging to debug the issue
        console.log("Stock detail API Response:", {
            message: responseData.message,
            dataKeys: responseData.data ? Object.keys(responseData.data) : [],
            hasProductImages: responseData.data?.product_images ? true : false,
            productImagesLength: responseData.data?.product_images?.length || 0,
            productImages: responseData.data?.product_images
                ? JSON.stringify(responseData.data.product_images, null, 2)
                : "No images",
            hasInfoObat: responseData.data?.info_obat ? true : false,
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
                    message:
                        responseData.message || "Failed to fetch stock detail",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        // Ensure the data is properly structured before returning
        const stockData = responseData.data;

        // Transform product_images to ensure proper URL structure
        if (
            stockData?.product_images &&
            Array.isArray(stockData.product_images)
        ) {
            stockData.product_images = stockData.product_images.map(
                (img: any) => ({
                    id: img.id,
                    kd_brgdg: img.kd_brgdg,
                    url: img.gambar, // Map 'gambar' to 'url' for consistency with frontend
                    gambar: img.gambar, // Keep original field
                    main_display: img.main_display,
                    created_at: img.created_at,
                })
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Stock detail retrieved successfully",
            data: stockData,
        });
    } catch (error) {
        console.error("Stock detail API error:", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to stock API server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred while fetching stock detail",
            },
            { status: 500 }
        );
    }
}
