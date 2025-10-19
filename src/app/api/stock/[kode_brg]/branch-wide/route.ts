// app/api/stock/[kode_brg]/branch-wide/route.ts
import { createApiHandler, createDynamicGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createDynamicGetHandler("/stock/[kode_brg]?with_stock_details=true", {
    validateParams: (params) => !!params.kode_brg,
    paramValidationMessage: "Product code is required"
  })
});

export const GET = handler;
