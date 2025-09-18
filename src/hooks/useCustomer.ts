"use client";

import { useState, useEffect } from "react";
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

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
            });

            console.log(
                "Fetching customers with params:",
                queryParams.toString()
            );

            const response = await fetch(
                `/api/customer?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: CustomerApiResponse = await response.json();

            console.log("Customer hook response:", {
                status: response.status,
                success: data.success,
                message: data.message,
                dataExists: !!data.data,
            });

            if (!response.ok) {
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

            if (data.success && data.data?.docs) {
                console.log(
                    "Customer data loaded successfully:",
                    data.data.docs.length,
                    "customers"
                );
                setCustomerList(data.data.docs);
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
    };

    useEffect(() => {
        fetchCustomers();
    }, [limit, offset]);

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
