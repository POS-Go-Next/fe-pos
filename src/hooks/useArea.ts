"use client";

import { useState, useEffect } from "react";

interface AreaData {
    id_area: string;
    nama_area: string;
}

interface AreaApiResponse {
    success: boolean;
    message: string;
    data?: {
        docs: AreaData[];
        totalDocs: number;
        page: number;
        totalPages: number;
    };
    errors?: any;
}

interface UseAreaReturn {
    areaList: AreaData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    totalPages?: number;
    totalDocs?: number;
}

interface UseAreaParams {
    limit?: number;
    offset?: number;
    search?: string;
}

export const useArea = (params: UseAreaParams = {}): UseAreaReturn => {
    const { limit = 50, offset = 0, search = "" } = params;

    const [areaList, setAreaList] = useState<AreaData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>();
    const [totalDocs, setTotalDocs] = useState<number>();

    const fetchArea = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
            });

            if (search) {
                queryParams.append("search", search);
            }

            const response = await fetch(
                `/api/area?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: AreaApiResponse = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success && data.data?.docs) {
                setAreaList(data.data.docs);
                setTotalPages(data.data.totalPages);
                setTotalDocs(data.data.totalDocs);
            } else {
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching area:", err);
            setError(
                err instanceof Error ? err.message : "Failed to fetch area data"
            );
            setAreaList([]);
            setTotalPages(undefined);
            setTotalDocs(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArea();
    }, [limit, offset, search]);

    const refetch = () => {
        fetchArea();
    };

    return {
        areaList,
        isLoading,
        error,
        refetch,
        totalPages,
        totalDocs,
    };
};
