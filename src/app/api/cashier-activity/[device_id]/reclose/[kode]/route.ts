import { createApiHandler, createDynamicPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



const handler = createApiHandler({
  POST: createDynamicPostHandler("/cashier-activity/[device_id]/reclose/[kode]", {
    validateBody: () => true, // No body validation needed
    transformBody: () => ({}) // Empty body
  })
});

export const POST = handler;
