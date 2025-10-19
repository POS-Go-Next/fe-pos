import { createApiHandler, createPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  POST: createPostHandler("/parameter/upsert")
});

export const POST = handler;
