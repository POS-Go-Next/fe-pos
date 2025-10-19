import { createApiHandler, createDynamicPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  POST: createDynamicPostHandler("/transaction/[id]/print", {
    validateBody: (body: unknown) => {
      return !!(body as { device_id?: string }).device_id;
    },
    bodyValidationMessage: "Device ID is required",
    transformBody: (body: unknown) => ({
      device_id: (body as { device_id: string }).device_id
    })
  })
});

export const POST = handler;
