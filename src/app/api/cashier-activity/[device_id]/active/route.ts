// app/api/cashier-activity/[device_id]/active/route.ts
import { createApiHandler, createDynamicGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createDynamicGetHandler("/cashier-activity/[device_id]/active", {
    validateParams: (params) => !!params.device_id,
    paramValidationMessage: "Device ID is required"
  })
});

export const GET = handler;
