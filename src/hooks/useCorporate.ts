// hooks/useCorporate.ts
"use client";

import { useState, useEffect } from "react";
import type {
    CorporateData,
    CorporateApiResponse,
    CorporateApiParams,
} from "@/types/corporate";

interface UseCorporateReturn {
    corporateList: CorporateData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    totalPages?: number;
    totalDocs?: number;
}

export const useCorporate = (
    params: CorporateApiParams
): UseCorporateReturn => {
    const { limit = 10, offset = 0, search = "", type = "corporate" } = params;

    const [corporateList, setCorporateList] = useState<CorporateData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>();
    const [totalDocs, setTotalDocs] = useState<number>();

    const fetchCorporates = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
                type, // Required parameter
            });

            // Add search parameter if provided
            if (search.trim()) {
                queryParams.append("search", search.trim());
            }

            console.log(
                "Fetching corporates with params:",
                queryParams.toString()
            );

            const response = await fetch(
                `/api/corporate?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: CorporateApiResponse = await response.json();

            console.log("Corporate hook response:", {
                status: response.status,
                success: data.success,
                message: data.message,
                dataExists: !!data.data,
            });

            if (!response.ok) {
                console.error("Corporate API request failed:", {
                    status: response.status,
                    data,
                });

                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success && data.data?.docs) {
                console.log(
                    "Corporate data loaded successfully:",
                    data.data.docs.length,
                    "corporates"
                );
                setCorporateList(data.data.docs);
                setTotalPages(data.data.totalPages);
                setTotalDocs(data.data.totalDocs);
            } else {
                console.error("Invalid corporate data structure:", data);
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching corporates:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch corporate data"
            );
            setCorporateList([]);
            setTotalPages(undefined);
            setTotalDocs(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCorporates();
    }, [limit, offset, search, type]);

    const refetch = () => {
        fetchCorporates();
    };

    return {
        corporateList,
        isLoading,
        error,
        refetch,
        totalPages,
        totalDocs,
    };
};
