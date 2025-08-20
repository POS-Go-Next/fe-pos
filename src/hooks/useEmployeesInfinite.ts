// hooks/useEmployeesInfinite.ts
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { UserData } from "@/types/user";

interface UseEmployeesInfiniteProps {
    limit?: number;
    enabled?: boolean;
}

interface EmployeesResponse {
    data: UserData[];
    total: number;
    hasMore: boolean;
}

interface UseEmployeesInfiniteReturn {
    employees: UserData[];
    filteredEmployees: UserData[];
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    hasMoreData: boolean;
    totalCount: number;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    loadMore: () => void;
    refetch: () => void;
    isSessionExpired: boolean;
}

export const useEmployeesInfinite = ({
    limit = 20,
    enabled = true,
}: UseEmployeesInfiniteProps = {}): UseEmployeesInfiniteReturn => {
    const [employees, setEmployees] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    // Filter employees based on search term
    const filteredEmployees = useMemo(() => {
        if (!searchTerm.trim()) return employees;

        const term = searchTerm.toLowerCase();
        return employees.filter(
            (employee) =>
                employee.fullname?.toLowerCase().includes(term) ||
                employee.username?.toLowerCase().includes(term) ||
                employee.email?.toLowerCase().includes(term)
        );
    }, [employees, searchTerm]);

    const fetchEmployees = useCallback(
        async (offset: number = 0, isLoadingMore: boolean = false) => {
            if (!enabled) return;

            try {
                if (isLoadingMore) {
                    setIsLoadingMore(true);
                } else {
                    setIsLoading(true);
                    setError(null);
                    setIsSessionExpired(false);
                }

                console.log(
                    `🔍 Fetching employees: offset=${offset}, limit=${limit}`
                );

                const queryParams = new URLSearchParams({
                    offset: offset.toString(),
                    limit: limit.toString(),
                });

                const response = await fetch(
                    `/api/user?${queryParams.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        setIsSessionExpired(true);
                        throw new Error("Session expired. Please login again.");
                    }
                    throw new Error(
                        `HTTP ${response.status}: Failed to fetch employees`
                    );
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.message || "Failed to fetch employees"
                    );
                }

                const newEmployees = result.data?.docs || [];
                const total = result.data?.totalDocs || 0;
                const hasMore = offset + newEmployees.length < total;

                console.log(
                    `✅ Fetched ${newEmployees.length} employees, total: ${total}, hasMore: ${hasMore}`
                );

                if (isLoadingMore) {
                    // Append new employees to existing list
                    setEmployees((prev) => {
                        const existingIds = new Set(
                            prev.map((emp: UserData) => emp.id)
                        );
                        const uniqueNewEmployees = newEmployees.filter(
                            (emp: UserData) => !existingIds.has(emp.id)
                        );
                        return [...prev, ...uniqueNewEmployees];
                    });
                } else {
                    // Replace employees list (first load or refresh)
                    setEmployees(newEmployees);
                }

                setTotalCount(total);
                setHasMoreData(hasMore);
                setCurrentOffset(offset + newEmployees.length);
            } catch (error) {
                console.error("❌ Error fetching employees:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred";
                setError(errorMessage);

                if (errorMessage.includes("Session expired")) {
                    setIsSessionExpired(true);
                }
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [enabled, limit]
    );

    const loadMore = useCallback(() => {
        if (!hasMoreData || isLoadingMore || isLoading) {
            console.log("🚫 Cannot load more:", {
                hasMoreData,
                isLoadingMore,
                isLoading,
            });
            return;
        }

        console.log("📥 Loading more employees from offset:", currentOffset);
        fetchEmployees(currentOffset, true);
    }, [hasMoreData, isLoadingMore, isLoading, currentOffset, fetchEmployees]);

    const refetch = useCallback(() => {
        console.log("🔄 Refetching employees from beginning");
        setCurrentOffset(0);
        setEmployees([]);
        setHasMoreData(true);
        fetchEmployees(0, false);
    }, [fetchEmployees]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchEmployees(0, false);
        }
    }, [enabled, fetchEmployees]);

    // Reset search when employees change
    useEffect(() => {
        if (searchTerm && employees.length === 0) {
            setSearchTerm("");
        }
    }, [employees.length, searchTerm]);

    return {
        employees,
        filteredEmployees,
        isLoading,
        isLoadingMore,
        error,
        hasMoreData,
        totalCount,
        searchTerm,
        setSearchTerm,
        loadMore,
        refetch,
        isSessionExpired,
    };
};
