// app/api/kassa/[device_id]/route.ts
import { createApiHandler, createDynamicGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createDynamicGetHandler("/kassa/[device_id]", {
    validateParams: (params) => !!params.device_id,
    paramValidationMessage: "Device ID is required"
  })
});

export const GET = handler;
