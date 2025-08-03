// hooks/useKassaData.ts
"use client";

import { useState, useEffect } from "react";
import { isSessionExpired } from "@/lib/sessionHandler";
import type { KassaResponse, KassaExternalApiResponse } from "@/types/kassa";

interface UseKassaDataParams {
    macAddress: string | null;
    enabled?: boolean;
}

interface UseKassaDataReturn {
    kassaData: KassaResponse | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    isSessionExpired: boolean;
}

export const useKassaData = ({
    macAddress,
    enabled = true,
}: UseKassaDataParams): UseKassaDataReturn => {
    const [kassaData, setKassaData] = useState<KassaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSessionExpiredState, setIsSessionExpiredState] = useState(false);

    const fetchKassaData = async () => {
        if (!macAddress || !enabled) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsSessionExpiredState(false);

        try {
            console.log(`🔄 Fetching kassa data for MAC: ${macAddress}`);

            const response = await fetch(`/api/kassa/${macAddress}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const result = await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    setIsSessionExpiredState(true);
                    return;
                }

                const errorMessage =
                    result.message || "Failed to fetch kassa data";
                setError(errorMessage);
                return;
            }

            if (result.data) {
                setKassaData(result.data);
                console.log("✅ Kassa data fetched:", result.data);
            } else {
                setError("No kassa data found for this MAC address");
            }
        } catch (err) {
            console.error("❌ Error fetching kassa data:", err);

            let errorMessage = "Failed to fetch kassa data";

            if (err instanceof Error) {
                if (err.message.includes("fetch")) {
                    errorMessage =
                        "Network error. Please check your connection.";
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (macAddress && enabled) {
            fetchKassaData();
        }
    }, [macAddress, enabled]);

    return {
        kassaData,
        isLoading,
        error,
        refetch: fetchKassaData,
        isSessionExpired: isSessionExpiredState,
    };
};
