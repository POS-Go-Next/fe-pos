"use client";

import { useState, useEffect, useCallback } from "react";
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

    const fetchBranchWideStock = useCallback(async () => {
        console.log('🔍 useBranchWideStock - Parameters:', { kode_brg, enabled });
        if (!kode_brg || !enabled) {
            console.log('❌ useBranchWideStock - Skipping fetch:', { kode_brg_missing: !kode_brg, enabled_false: !enabled });
            setBranchStockData(null);
            setBranchTableData([]);
            return;
        }

        console.log('✅ useBranchWideStock - Making API call to:', `/api/stock/${kode_brg}/branch-wide`);

        try {
            setIsLoading(true);
            setError(null);const response = await fetch(`/api/stock/${kode_brg}/branch-wide`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data: BranchWideStockApiResponse = await response.json();if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success && data.data) {
                setBranchStockData(data.data);

                if (
                    data.data.stock_details &&
                    Array.isArray(data.data.stock_details)
                ) {
                    const tableData: BranchStockTableData[] =
                        data.data.stock_details
                            .filter((detail) => {
                                if (!detail || !detail.kd_cab) {
                                    console.warn(
                                        "Invalid stock detail entry:",
                                        detail
                                    );
                                    return false;
                                }
                                return true;
                            })
                            .map((detail) => {
                                const branchName =
                                    detail.cabang?.nama_cabang ||
                                    detail.kd_cab ||
                                    "Unknown Branch";
                                const phoneNumber =
                                    detail.cabang?.no_telepon ||
                                    detail.cabang?.no_hp ||
                                    "-";
                                const statusAktif =
                                    detail.status_aktif?.trim() || "UNKNOWN";

                                return {
                                    idBranch: detail.kd_cab,
                                    branchName: branchName,
                                    stock: detail.stock || 0,
                                    dateAdded: formatDateForDisplay(
                                        detail.updated_at
                                    ),
                                    phoneNumber: phoneNumber,
                                    description:
                                        statusAktif === "AKTIF"
                                            ? "ONLINE"
                                            : statusAktif,
                                };
                            });

                    setBranchTableData(tableData);} else {
                    console.warn("No valid stock_details found in response");
                    setBranchTableData([]);
                }
            } else {
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching branch wide stock:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch branch wide stock"
            );
            setBranchStockData(null);
            setBranchTableData([]);
        } finally {
            setIsLoading(false);
        }
    }, [kode_brg, enabled]);

    const formatDateForDisplay = (dateString: string): string => {
        try {
            if (!dateString) return "-";

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return dateString;
            }

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
            return dateString || "-";
        }
    };

    useEffect(() => {
        fetchBranchWideStock();
    }, [kode_brg, enabled, fetchBranchWideStock]);

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
