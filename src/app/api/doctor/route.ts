import { createApiHandler, createPaginatedGetHandler, createPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createPaginatedGetHandler("/doctor", {
    defaultParams: { limit: "100", sort_by: "id", sort_order: "desc" },
    validateResponse: (data) => !!data.data
  }),
  POST: createPostHandler("/doctor")
});

export const GET = handler;
export const POST = handler;
