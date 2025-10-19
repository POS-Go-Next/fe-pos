import { createApiHandler, createPaginatedGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createPaginatedGetHandler("/promo", {
    defaultParams: { limit: "10" },
    validateResponse: (data) => !!data.data
  })
});

export const GET = handler;
