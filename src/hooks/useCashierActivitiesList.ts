"use client";

import { isSessionExpired } from "@/lib/sessionHandler";
import { useState } from "react";

interface CashierData {
    id: number;
    fullname: string;
    username: string;
    email: string;
    phone: string;
    role_id: number;
    position_id?: number;
}

interface CashierActivityItem {
    kode: string;
    tanggal: string;
    tgl_trans: string;
    kd_kasir: string;
    kd_kassa: string;
    shift: string;
    tanggal_opening: string;
    jam_opening: string;
    tanggal_closing?: string;
    jam_closing?: string;
    status_operasional: string;
    user_update?: string;
    status: string;
    tot_setor: number;
    cashier: CashierData;
}

interface CashierActivitiesListData {
    docs: CashierActivityItem[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

interface CashierActivitiesListApiResponse {
    success: boolean;
    message: string;
    data?: CashierActivitiesListData;
}

interface UseCashierActivitiesListReturn {
    getCashierActivitiesList: (
        limit?: number,
        offset?: number,
        customSessionHandler?: () => Promise<void>
    ) => Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: CashierActivitiesListData;
        error?: string;
    }>;
    isLoading: boolean;
    error: string | null;
    lastResponse: CashierActivitiesListData | null;
}

export const useCashierActivitiesList = (): UseCashierActivitiesListReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] =
        useState<CashierActivitiesListData | null>(null);

    const getCashierActivitiesList = async (
        limit: number = 10,
        offset: number = 0,
        customSessionHandler?: () => Promise<void>
    ): Promise<{
        success: boolean;
        isSessionExpired: boolean;
        data?: CashierActivitiesListData;
        error?: string;
    }> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log(
                "🔄 Getting cashier activities list with limit:",
                limit,
                "offset:",
                offset
            );

            const response = await fetch(
                `/api/cashier-activities?limit=${limit}&offset=${offset}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            const result: CashierActivitiesListApiResponse =
                await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    if (customSessionHandler) {
                        await customSessionHandler();
                    }
                    return { success: false, isSessionExpired: true };
                }

                const errorMessage =
                    result.message || "Failed to get cashier activities list";
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
                    "✅ Cashier activities list retrieved successfully:",
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
            console.error("❌ Error getting cashier activities list:", err);

            let errorMessage = "Failed to get cashier activities list";

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
        getCashierActivitiesList,
        isLoading,
        error,
        lastResponse,
    };
};
