// hooks/useBranchWideStock.ts
"use client";

import { useState, useEffect } from "react";
import type {
  BranchWideStockData,
  BranchWideStockApiResponse,
  BranchStockTableData,
} from "@/types/branch-stock";

interface UseBranchWideStockReturn {
  branchStockData: BranchWideStockData | null;
  branchTableData: BranchStockTableData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseBranchWideStockParams {
  kode_brg: string | null;
  enabled?: boolean;
}

export const useBranchWideStock = ({
  kode_brg,
  enabled = true,
}: UseBranchWideStockParams): UseBranchWideStockReturn => {
  const [branchStockData, setBranchStockData] =
    useState<BranchWideStockData | null>(null);
  const [branchTableData, setBranchTableData] = useState<
    BranchStockTableData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranchWideStock = async () => {
    if (!kode_brg || !enabled) {
      setBranchStockData(null);
      setBranchTableData([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching branch wide stock for:", kode_brg);

      // Call our Next.js API route
      const response = await fetch(`/api/stock/${kode_brg}/branch-wide`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: BranchWideStockApiResponse = await response.json();

      console.log("Branch wide stock hook response:", {
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
        setBranchStockData(data.data);

        // Transform stock_details menjadi table data
        const tableData: BranchStockTableData[] = data.data.stock_details.map(
          (detail) => ({
            idBranch: detail.kd_cab,
            branchName: detail.cabang.nama_cabang,
            stock: detail.stock,
            dateAdded: formatDateForDisplay(detail.updated_at),
            phoneNumber: detail.cabang.no_telepon || detail.cabang.no_hp || "-",
            description: detail.status_aktif.trim() || "ONLINE",
          })
        );

        setBranchTableData(tableData);
        console.log(
          "Branch wide stock data loaded successfully:",
          tableData.length,
          "branches"
        );
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching branch wide stock:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch branch wide stock"
      );
      setBranchStockData(null);
      setBranchTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function untuk format tanggal
  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
        " " +
        date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    fetchBranchWideStock();
  }, [kode_brg, enabled]);

  const refetch = () => {
    fetchBranchWideStock();
  };

  return {
    branchStockData,
    branchTableData,
    isLoading,
    error,
    refetch,
  };
};
