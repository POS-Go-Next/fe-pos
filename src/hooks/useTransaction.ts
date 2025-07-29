// hooks/useTransaction.ts - UPDATED
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
  const { limit = 10, offset = 0, from_date = "", to_date = "" } = params;

  const [transactionList, setTransactionList] = useState<TransactionData[]>([]);
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

      if (from_date) {
        queryParams.append("from_date", from_date);
      }
      if (to_date) {
        queryParams.append("to_date", to_date);
      }

      console.log("Fetching transactions with params:", queryParams.toString());

      const response = await fetch(
        `/api/transaction?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: TransactionApiResponse = await response.json();

      console.log("Transaction hook response:", {
        status: response.status,
        success: data.success,
        message: data.message,
        dataExists: !!data.data,
      });

      if (!response.ok) {
        console.error("Transaction API request failed:", {
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
          "Transaction data loaded successfully:",
          data.data.docs.length,
          "transactions"
        );
        setTransactionList(data.data.docs);
        setTotalPages(data.data.totalPages);
        setTotalDocs(data.data.totalDocs);
        setCurrentPage(data.data.page);
      } else {
        console.error("Invalid transaction data structure:", data);
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transaction data"
      );
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
  }, [limit, offset, from_date, to_date]);

  const refetch = () => {
    fetchTransactions();
  };

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
