import { createApiHandler, createPaginatedGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createPaginatedGetHandler("/corporate", {
    defaultParams: { limit: "10", type: "corporate" },
    validateResponse: (data) => !!data.data
  })
});

export const GET = handler;
