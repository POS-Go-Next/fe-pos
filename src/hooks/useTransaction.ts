// hooks/useTransaction.ts - UPDATED WITH PRODUCT CODE FILTER
"use client";

import { useState, useEffect } from "react";
import type {
    TransactionData,
    TransactionApiResponse,
    TransactionApiParams,
} from "@/types/transaction";

interface UseTransactionReturn {
    transactionList: TransactionData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    totalPages?: number;
    totalDocs?: number;
    currentPage?: number;
}

export const useTransaction = (
    params: TransactionApiParams = {}
): UseTransactionReturn => {
    const {
        limit = 10,
        offset = 0,
        from_date = "",
        to_date = "",
        bought_product_code = "",
    } = params;

    const [transactionList, setTransactionList] = useState<TransactionData[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>();
    const [totalDocs, setTotalDocs] = useState<number>();
    const [currentPage, setCurrentPage] = useState<number>();

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                limit: limit.toString(),
            });

            if (from_date) queryParams.append("from_date", from_date);
            if (to_date) queryParams.append("to_date", to_date);
            if (bought_product_code)
                queryParams.append("bought_product_code", bought_product_code);

            const response = await fetch(
                `/api/transaction?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const data: TransactionApiResponse = await response.json();

            if (!response.ok) {
                console.error(
                    "Transaction API error:",
                    response.status,
                    data.message
                );
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            if (data.success && data.data) {
                setTransactionList(data.data.docs || []);
                setTotalPages(data.data.totalPages);
                setTotalDocs(data.data.totalDocs);
                setCurrentPage(data.data.page);
            } else {
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err: any) {
            console.error("useTransaction error:", err.message);
            setError(err.message || "Failed to fetch transaction data");
            setTransactionList([]);
            setTotalPages(undefined);
            setTotalDocs(undefined);
            setCurrentPage(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [limit, offset, from_date, to_date, bought_product_code]);

    const refetch = () => fetchTransactions();

    return {
        transactionList,
        isLoading,
        error,
        refetch,
        totalPages,
        totalDocs,
        currentPage,
    };
};
