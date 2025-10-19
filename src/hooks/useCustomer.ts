"use client";

import { useState, useEffect, useCallback } from "react";
import type {
    CustomerData,
    CustomerApiResponse,
    CustomerApiParams,
} from "@/types/customer";

interface UseCustomerReturn {
    customerList: CustomerData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    totalPages?: number;
    totalDocs?: number;
}

export const useCustomer = (
    params: CustomerApiParams = {}
): UseCustomerReturn => {
    const { limit = 100, offset = 0 } = params;

    const [customerList, setCustomerList] = useState<CustomerData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>();
    const [totalDocs, setTotalDocs] = useState<number>();

    const fetchCustomers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
            });const response = await fetch(
                `/api/customer?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: CustomerApiResponse = await response.json();if (!response.ok) {
                console.error("Customer API request failed:", {
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

            if (data.success && data.data?.docs) {setCustomerList(data.data.docs);
                setTotalPages(data.data.totalPages);
                setTotalDocs(data.data.totalDocs);
            } else {
                console.error("Invalid customer data structure:", data);
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching customers:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch customer data"
            );
            setCustomerList([]);
            setTotalPages(undefined);
            setTotalDocs(undefined);
        } finally {
            setIsLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchCustomers();
    }, [limit, offset, fetchCustomers]);

    const refetch = () => {
        fetchCustomers();
    };

    return {
        customerList,
        isLoading,
        error,
        refetch,
        totalPages,
        totalDocs,
    };
};
