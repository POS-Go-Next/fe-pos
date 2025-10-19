// app/api/cashier-activity/[device_id]/close/route.ts
import { createApiHandler, createDynamicPatchHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  PATCH: createDynamicPatchHandler("/cashier-activity/[device_id]/close", {
    validateParams: (params) => !!params.device_id,
    paramValidationMessage: "Device ID is required"
  })
});

export const PATCH = handler;
