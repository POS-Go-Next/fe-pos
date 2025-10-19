import { createApiHandler, createGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createGetHandler("/parameter/me")
});

export const GET = handler;
