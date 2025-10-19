"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UserData } from "@/types/user";

interface UseEmployeesInfiniteProps {
    limit?: number;
    enabled?: boolean;
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
    limit = 10,
    enabled = true,
}: UseEmployeesInfiniteProps = {}): UseEmployeesInfiniteReturn => {
    const [employees, setEmployees] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTermState] = useState("");
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const isFetchingRef = useRef(false);
    const lastEnabledRef = useRef(enabled);
    const lastSearchTermRef = useRef("");
    const hasInitialFetchRef = useRef(false);

    const filteredEmployees = searchTerm.trim()
        ? employees.filter(
              (employee) =>
                  employee.fullname
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  employee.username
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  employee.email
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
          )
        : employees;

    const fetchEmployees = useCallback(
        async (
            page: number = 1,
            isLoadingMore: boolean = false,
            searchQuery: string = ""
        ) => {
            if (!enabled || isFetchingRef.current) {
                return;
            }

            try {
                isFetchingRef.current = true;

                if (isLoadingMore) {
                    setIsLoadingMore(true);
                } else {
                    setIsLoading(true);
                    setError(null);
                    setIsSessionExpired(false);
                }

                const offset = (page - 1) * limit;
                const queryParams = new URLSearchParams({
                    offset: offset.toString(),
                    limit: limit.toString(),
                });

                if (searchQuery.trim()) {
                    queryParams.append("search", searchQuery.trim());
                }

                const response = await fetch(
                    `/api/user?${queryParams.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                                "auth-token"
                            )}`,
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

                if (
                    result.message !== "User data retrieved successfully" ||
                    !result.data
                ) {
                    throw new Error(
                        result.message || "Invalid response format"
                    );
                }

                const newEmployees = result.data.docs || [];
                const total = result.data.totalDocs || 0;
                const totalPages = result.data.totalPages || 0;
                const currentApiPage = result.data.page || 1;
                const hasMore = currentApiPage < totalPages;
                
                if (isLoadingMore) {
                    setEmployees((prev) => {
                        const existingIds = new Set(
                            prev.map((emp: UserData) => emp.id)
                        );
                        const uniqueNewEmployees = newEmployees.filter(
                            (emp: UserData) => !existingIds.has(emp.id)
                        );
                        return [...prev, ...uniqueNewEmployees];
                    });
                    setCurrentPage(page);
                } else {
                    setEmployees(newEmployees);
                    setCurrentPage(1);
                }

                setTotalCount(total);
                setHasMoreData(hasMore);
            } catch (error) {
                console.error("Error fetching employees:", error);
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
                isFetchingRef.current = false;
            }
        },
        [enabled, limit]
    );

    const loadMore = useCallback(() => {
        if (
            !hasMoreData ||
            isLoadingMore ||
            isLoading ||
            isFetchingRef.current
        ) {
            return;
        }

        const nextPage = currentPage + 1;
        fetchEmployees(nextPage, true, lastSearchTermRef.current);
    }, [hasMoreData, isLoadingMore, isLoading, currentPage, fetchEmployees]);

    const refetch = useCallback(() => {
        if (isFetchingRef.current) {
            return;
        }
        setCurrentPage(1);
        setEmployees([]);
        setHasMoreData(true);
        setTotalCount(0);
        hasInitialFetchRef.current = true;
        fetchEmployees(1, false, lastSearchTermRef.current);
    }, [fetchEmployees]);

    const setSearchTerm = useCallback(
        (term: string) => {
            setSearchTermState(term);
            lastSearchTermRef.current = term;

            if (term !== lastSearchTermRef.current) {
                setCurrentPage(1);
                setEmployees([]);
                setHasMoreData(true);

                if (enabled && hasInitialFetchRef.current) {
                    fetchEmployees(1, false, term);
                }
            }
        },
        [enabled, fetchEmployees]
    );

    useEffect(() => {
        if (enabled && !lastEnabledRef.current && !hasInitialFetchRef.current) {
            hasInitialFetchRef.current = true;
            fetchEmployees(1, false, "");
        } else if (!enabled && lastEnabledRef.current) {
            setEmployees([]);
            setError(null);
            setCurrentPage(1);
            setTotalCount(0);
            setHasMoreData(true);
            hasInitialFetchRef.current = false;
        }

        lastEnabledRef.current = enabled;
    }, [enabled, fetchEmployees]);

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
