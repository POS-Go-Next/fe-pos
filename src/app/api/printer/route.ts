import { createApiHandler, createPaginatedGetHandler } from "@/lib/api-utils";
import type { PaginationData } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createPaginatedGetHandler("/printer", {
    defaultParams: { limit: "10" },
    validateResponse: (response) => 
      !!response.data && Array.isArray((response.data as PaginationData<unknown>).docs)
  })
});

export const GET = handler;
