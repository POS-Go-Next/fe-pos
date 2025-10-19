"use client";

import { useState } from "react";
import type {
  PrintTransactionPayload,
  PrintTransactionResponse,
} from "@/types/transaction";

interface UsePrintTransactionReturn {
  printTransaction: (
    transactionId: string,
    deviceId: string
  ) => Promise<PrintTransactionResponse>;
  isLoading: boolean;
  error: string | null;
}

export const usePrintTransaction = (): UsePrintTransactionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printTransaction = async (
    transactionId: string,
    deviceId: string
  ): Promise<PrintTransactionResponse> => {
    try {
      setIsLoading(true);
      setError(null);const payload: PrintTransactionPayload = {
        device_id: deviceId,
      };

      const response = await fetch(
        `/api/transaction/${transactionId.trim()}/print`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data: PrintTransactionResponse = await response.json();

      if (!response.ok) {
        console.error(
          "Print transaction error:",
          response.status,
          data.message
        );
        throw new Error(data.message || `HTTP ${response.status}`);
      }return data;
    } catch (err) {
      console.error("usePrintTransaction error:", err instanceof Error ? err.message : err);
      const errorMessage = err instanceof Error ? err.message : "Failed to print transaction";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    printTransaction,
    isLoading,
    error,
  };
};
