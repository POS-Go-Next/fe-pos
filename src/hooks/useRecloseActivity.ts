"use client";

import { isSessionExpired } from "@/lib/sessionHandler";
import { useState } from "react";

interface RecloseActivityData {
    kode: string;
    tanggal: string;
    tgl_trans: string;
    kd_kasir: string;
    kd_kassa: string;
    shift: string;
    tanggal_opening: string;
    jam_opening: string;
    tanggal_closing: string;
    jam_closing: string;
    status_operasional: string;
    user_update: string;
    status: string;
    tot_setor: number;
}

interface RecloseActivityApiResponse {
    success: boolean;
    message: string;
    data?: RecloseActivityData;
}

interface UseRecloseActivityReturn {
    recloseActivity: (
        deviceId: string,
        kode: string,
        customSessionHandler?: () => Promise<void>
    ) => Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: RecloseActivityData;
        error?: string;
    }>;
    isLoading: boolean;
    error: string | null;
    lastResponse: RecloseActivityData | null;
}

export const useRecloseActivity = (): UseRecloseActivityReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] =
        useState<RecloseActivityData | null>(null);

    const recloseActivity = async (
        deviceId: string,
        kode: string,
        customSessionHandler?: () => Promise<void>
    ): Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: RecloseActivityData;
        error?: string;
    }> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log(
                "🔄 Reclosing cashier activity for device ID:",
                deviceId,
                "with kode:",
                kode
            );

            const response = await fetch(
                `/api/cashier-activity/${deviceId}/reclose/${kode}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            const result: RecloseActivityApiResponse = await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    if (customSessionHandler) {
                        await customSessionHandler();
                    }
                    return { success: false, isSessionExpired: true };
                }

                const errorMessage =
                    result.message || "Failed to reclose cashier activity";
                setError(errorMessage);
                return {
                    success: false,
                    isSessionExpired: false,
                    error: errorMessage,
                };
            }

            if (result.data) {
                setLastResponse(result.data);
                console.log(
                    "✅ Cashier activity reclosed successfully:",
                    result.data
                );
                return {
                    success: true,
                    isSessionExpired: false,
                    data: result.data,
                };
            } else {
                const errorMessage = "Invalid response from server";
                setError(errorMessage);
                return {
                    success: false,
                    isSessionExpired: false,
                    error: errorMessage,
                };
            }
        } catch (err) {
            console.error("❌ Error reclosing cashier activity:", err);

            let errorMessage = "Failed to reclose cashier activity";

            if (err instanceof TypeError && err.message.includes("fetch")) {
                errorMessage = "Network error. Please check your connection.";
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            return {
                success: false,
                isSessionExpired: false,
                error: errorMessage,
            };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        recloseActivity,
        isLoading,
        error,
        lastResponse,
    };
};
