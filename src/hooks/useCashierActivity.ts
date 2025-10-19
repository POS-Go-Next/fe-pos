"use client";

import { isSessionExpired } from "@/lib/sessionHandler";
import { useState } from "react";

export interface CashierActivityData {
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
    cashier?: {
        fullname?: string;
        username?: string;
    };
}

interface CashierActivityApiResponse {
    success: boolean;
    message: string;
    data?: CashierActivityData;
}

interface UseCashierActivityReturn {
    checkCashierActivity: (
        deviceId: string,
        customSessionHandler?: () => Promise<void>
    ) => Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: CashierActivityData;
        error?: string;
    }>;
    isLoading: boolean;
    error: string | null;
    lastResponse: CashierActivityData | null;
}

export const useCashierActivity = (): UseCashierActivityReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] =
        useState<CashierActivityData | null>(null);

    const checkCashierActivity = async (
        deviceId: string,
        customSessionHandler?: () => Promise<void>
    ): Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: CashierActivityData;
        error?: string;
    }> => {
        setIsLoading(true);
        setError(null);

        try {const response = await fetch(
                `/api/cashier-activity/${deviceId}/active`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            const result: CashierActivityApiResponse = await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    if (customSessionHandler) {
                        await customSessionHandler();
                    }
                    return { success: false, isSessionExpired: true };
                }

                const errorMessage =
                    result.message || "Failed to check cashier activity";
                setError(errorMessage);
                return {
                    success: false,
                    isSessionExpired: false,
                    error: errorMessage,
                };
            }

            if (result.data) {
                setLastResponse(result.data);return {
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
            console.error("❌ Error checking cashier activity:", err);

            let errorMessage = "Failed to check cashier activity";

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
        checkCashierActivity,
        isLoading,
        error,
        lastResponse,
    };
};
