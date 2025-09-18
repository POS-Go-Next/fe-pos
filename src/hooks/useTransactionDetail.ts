"use client";

import { useState, useEffect } from "react";
import type {
    TransactionDetailData,
    TransactionDetailApiResponse,
} from "@/types/transaction";

interface UseTransactionDetailReturn {
    transactionDetail: TransactionDetailData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UseTransactionDetailParams {
    invoice_number: string | null;
    enabled?: boolean;
}

export const useTransactionDetail = ({
    invoice_number,
    enabled = true,
}: UseTransactionDetailParams): UseTransactionDetailReturn => {
    const [transactionDetail, setTransactionDetail] =
        useState<TransactionDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactionDetail = async () => {
        if (!invoice_number || !enabled) {
            setTransactionDetail(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            console.log("Fetching transaction detail for:", invoice_number);

            const response = await fetch(
                `/api/transaction/invoice?invoice_number=${encodeURIComponent(
                    invoice_number
                )}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: TransactionDetailApiResponse = await response.json();

            console.log("Transaction detail hook response:", {
                status: response.status,
                success: data.success,
                message: data.message,
                dataExists: !!data.data,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success && data.data) {
                setTransactionDetail(data.data);
                console.log(
                    "Transaction detail loaded successfully:",
                    data.data.invoice_number
                );
            } else {
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching transaction detail:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch transaction detail"
            );
            setTransactionDetail(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactionDetail();
    }, [invoice_number, enabled]);

    const refetch = () => {
        fetchTransactionDetail();
    };

    return {
        transactionDetail,
        isLoading,
        error,
        refetch,
    };
};
