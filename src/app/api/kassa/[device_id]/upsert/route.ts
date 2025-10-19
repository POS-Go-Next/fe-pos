// app/api/kassa/[device_id]/upsert/route.ts
import { createApiHandler, createDynamicPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KassaUpsertData {
    default_jual: string;
    status_aktif: boolean;
    antrian: boolean;
    finger: string;
    device_id: string;
    printer_id: number | null;
}

const handler = createApiHandler({
  POST: createDynamicPostHandler("/kassa/[device_id]/upsert", {
    validateParams: (params) => !!params.device_id,
    paramValidationMessage: "Device ID is required",
    transformBody: (body: unknown) => {
      const rawBody = body as KassaUpsertData;
      return {
        default_jual: rawBody.default_jual,
        status_aktif: Boolean(rawBody.status_aktif),
        antrian: Boolean(rawBody.antrian),
        finger: rawBody.finger,
        device_id: rawBody.device_id,
        printer_id: rawBody.printer_id ? Number(rawBody.printer_id) : null,
      };
    },
    validateBody: (processedBody: unknown) => {
      const body = processedBody as {
        default_jual: string;
        status_aktif: boolean;
        antrian: boolean;
        finger: string;
        device_id: string;
        printer_id: number | null;
      };
      return !!(body.default_jual &&
        typeof body.status_aktif === "boolean" &&
        typeof body.antrian === "boolean" &&
        body.finger &&
        body.device_id &&
        (body.printer_id === null || typeof body.printer_id === "number"));
    },
    bodyValidationMessage: "Invalid request data. Please check all required fields."
  })
});

export const POST = handler;
