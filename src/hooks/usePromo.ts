// hooks/usePromo.ts
"use client";

import { useState, useEffect } from "react";
import type {
    PromoData,
    PromoPaginationData,
    PromoApiResponse,
} from "@/types/promo";

interface UsePromoReturn {
    promoList: PromoData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    totalPages?: number;
    totalDocs?: number;
}

interface UsePromoParams {
    limit?: number;
    offset?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export const usePromo = (params: UsePromoParams = {}): UsePromoReturn => {
    const {
        limit = 10,
        offset = 0,
        search = "",
        sort_by = "id",
        sort_order = "desc",
    } = params;

    const [promoList, setPromoList] = useState<PromoData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>();
    const [totalDocs, setTotalDocs] = useState<number>();

    const fetchPromos = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Only send offset and limit parameters as per API requirement
            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
            });

            // Remove search, sort_by, sort_order parameters

            const response = await fetch(
                `/api/promo?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: PromoApiResponse = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success && data.data?.docs) {
                setPromoList(data.data.docs);
                setTotalPages(data.data.totalPages);
                setTotalDocs(data.data.totalDocs);
            } else {
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching promos:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch promo data"
            );
            setPromoList([]);
            setTotalPages(undefined);
            setTotalDocs(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, [limit, offset]); // Remove search, sort_by, sort_order dependencies

    const refetch = () => {
        fetchPromos();
    };

    return {
        promoList,
        isLoading,
        error,
        refetch,
        totalPages,
        totalDocs,
    };
};
