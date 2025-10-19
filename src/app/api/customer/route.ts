import { createApiHandler, createPaginatedGetHandler, createPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createPaginatedGetHandler("/customer", {
    defaultParams: { limit: "100" },
    validateResponse: (data) => !!data.data
  }),
  POST: createPostHandler("/customer")
});

export const GET = handler;
export const POST = handler;
