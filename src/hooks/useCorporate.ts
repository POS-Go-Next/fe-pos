"use client";

import { useState, useEffect, useCallback } from "react";
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

    const fetchCorporates = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
                type,
            });

            if (search.trim()) {
                queryParams.append("search", search.trim());
            }const response = await fetch(
                `/api/corporate?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: CorporateApiResponse = await response.json();if (!response.ok) {
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

            if (data.success && data.data?.docs) {setCorporateList(data.data.docs);
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
    }, [limit, offset, search, type]);

    useEffect(() => {
        fetchCorporates();
    }, [limit, offset, search, type, fetchCorporates]);

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
