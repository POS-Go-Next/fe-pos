import { createApiHandler, createGetHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createGetHandler("/transaction/invoice")
});

export const GET = handler;
