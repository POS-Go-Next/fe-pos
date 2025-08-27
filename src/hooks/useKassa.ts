// hooks/useKassa.ts
"use client";

import { useState } from "react";
import { isSessionExpired } from "@/lib/sessionHandler";

interface KassaSetupData {
    default_jual: string;
    status_aktif: boolean;
    antrian: boolean;
    finger: string;
    device_id: string;
    printer_id: number | null;
}

interface KassaResponse {
    id_kassa: number;
    kd_cab: string;
    no_kassa: number;
    type_jual: string;
    antrian: boolean;
    status_aktif: boolean;
    status_operasional: string;
    user_operasional: number;
    tanggal_update: string;
    user_update: string;
    status: string;
    finger: string;
    default_jual: string;
    device_id: string;
    is_deleted: number;
    deleted_at: string;
}

interface KassaApiResponse {
    success: boolean;
    message: string;
    data?: KassaResponse;
    errors?: any;
}

interface UseKassaReturn {
    updateKassa: (
        deviceId: string,
        data: KassaSetupData,
        customSessionHandler?: () => Promise<void>
    ) => Promise<{
        success: boolean;
        isSessionExpired: boolean;
        error?: string;
    }>;
    isLoading: boolean;
    error: string | null;
    lastResponse: KassaResponse | null;
}

export const useKassa = (): UseKassaReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] = useState<KassaResponse | null>(
        null
    );

    const updateKassa = async (
        deviceId: string,
        data: KassaSetupData,
        customSessionHandler?: () => Promise<void>
    ): Promise<{
        success: boolean;
        isSessionExpired: boolean;
        error?: string;
    }> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("🔄 Updating kassa setup:", { deviceId, data });

            const response = await fetch(`/api/kassa/${deviceId}/upsert`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result: KassaApiResponse = await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    if (customSessionHandler) {
                        await customSessionHandler();
                    }
                    return { success: false, isSessionExpired: true };
                }

                const errorMessage =
                    result.message || "Failed to update kassa setup";
                setError(errorMessage);
                return {
                    success: false,
                    isSessionExpired: false,
                    error: errorMessage,
                };
            }

            if (result.success && result.data) {
                setLastResponse(result.data);
                console.log(
                    "✅ Kassa setup updated successfully:",
                    result.data
                );
                return { success: true, isSessionExpired: false };
            } else {
                const errorMessage =
                    result.message || "Invalid response from server";
                setError(errorMessage);
                return {
                    success: false,
                    isSessionExpired: false,
                    error: errorMessage,
                };
            }
        } catch (err) {
            console.error("❌ Error updating kassa:", err);

            let errorMessage = "Failed to update kassa setup";

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
        updateKassa,
        isLoading,
        error,
        lastResponse,
    };
};
