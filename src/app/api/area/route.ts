import { createApiHandler, createPaginatedGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createPaginatedGetHandler("/area", {
    defaultParams: { limit: "50" },
    validateResponse: (data) => data.message === "Get paginated area successful"
  })
});

export const GET = handler;
