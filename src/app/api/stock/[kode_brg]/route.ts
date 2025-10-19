// app/api/stock/[kode_brg]/route.ts
import { createApiHandler, createDynamicGetHandler } from "@/lib/api-utils";
import { ProductImage } from "@/types/stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createDynamicGetHandler("/stock/[kode_brg]", {
    validateParams: (params) => !!params.kode_brg,
    paramValidationMessage: "Product code is required",
    transformResponse: (stockData: unknown) => {
      // Transform product_images to ensure proper URL structure
      const data = stockData as { product_images?: ProductImage[] };
      if (data?.product_images && Array.isArray(data.product_images)) {
        data.product_images = data.product_images.map((img: ProductImage) => ({
          id: img.id,
          kd_brgdg: img.kd_brgdg,
          url: img.gambar, // Map 'gambar' to 'url' for consistency with frontend
          gambar: img.gambar, // Keep original field
          main_display: img.main_display,
          created_at: img.created_at,
        }));
      }
      return data;
    }
  })
});

export const GET = handler;
