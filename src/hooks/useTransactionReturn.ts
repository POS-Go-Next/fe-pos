"use client";

import { useState } from "react";
import { clientFetch } from "@/lib/client-utils";

interface ReturnTransactionData {
  invoice_number: string;
  transaction_action: 0 | 2; // 0 = full return, 2 = item-based return
  retur_reason?: string;
  confirmation_retur_by?: string;
  returned_items?: Array<{
    product_code: string;
    quantity: number;
    return_reason?: string;
  }>;
}

interface UseTransactionReturnReturn {
  processReturn: (data: ReturnTransactionData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useTransactionReturn = (): UseTransactionReturnReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processReturn = async (data: ReturnTransactionData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: result } = await clientFetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      if (!result.success) {
        throw new Error(result.message || "Return processing failed");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processReturn,
    isLoading,
    error,
  };
};