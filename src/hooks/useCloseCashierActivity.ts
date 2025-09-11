// hooks/useCloseCashierActivity.ts
"use client";

import { isSessionExpired } from "@/lib/sessionHandler";
import { useState } from "react";

interface CloseCashierActivityData {
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

interface CloseCashierActivityApiResponse {
    success: boolean;
    message: string;
    data?: CloseCashierActivityData;
}

interface UseCloseCashierActivityReturn {
    closeCashierActivity: (
        deviceId: string,
        customSessionHandler?: () => Promise<void>
    ) => Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: CloseCashierActivityData;
        error?: string;
    }>;
    isLoading: boolean;
    error: string | null;
    lastResponse: CloseCashierActivityData | null;
}

export const useCloseCashierActivity = (): UseCloseCashierActivityReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] =
        useState<CloseCashierActivityData | null>(null);

    const closeCashierActivity = async (
        deviceId: string,
        customSessionHandler?: () => Promise<void>
    ): Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: CloseCashierActivityData;
        error?: string;
    }> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("🔄 Closing cashier activity for device ID:", deviceId);

            const response = await fetch(
                `/api/cashier-activity/${deviceId}/close`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            const result: CloseCashierActivityApiResponse =
                await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    if (customSessionHandler) {
                        await customSessionHandler();
                    }
                    return { success: false, isSessionExpired: true };
                }

                const errorMessage =
                    result.message || "Failed to close cashier activity";
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
                    "✅ Cashier activity closed successfully:",
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
            console.error("❌ Error closing cashier activity:", err);

            let errorMessage = "Failed to close cashier activity";

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
        closeCashierActivity,
        isLoading,
        error,
        lastResponse,
    };
};
