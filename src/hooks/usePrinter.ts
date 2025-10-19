"use client";

import { isSessionExpired } from "@/lib/sessionHandler";
import type { PrinterData } from "@/types/printer";
import { useEffect, useState, useCallback } from "react";

interface UsePrinterParams {
    offset?: number;
    limit?: number;
    enabled?: boolean;
}

interface UsePrinterReturn {
    printers: PrinterData[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    isSessionExpired: boolean;
}

export const usePrinter = ({
    offset = 0,
    limit = 10,
    enabled = true,
}: UsePrinterParams = {}): UsePrinterReturn => {
    const [printers, setPrinters] = useState<PrinterData[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSessionExpiredState, setIsSessionExpiredState] = useState(false);

    const fetchPrinters = useCallback(async () => {
        if (!enabled) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsSessionExpiredState(false);

        try {
            const response = await fetch(
                `/api/printer?offset=${offset}&limit=${limit}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (isSessionExpired(response, result)) {
                    setIsSessionExpiredState(true);
                    return;
                }

                const errorMessage =
                    result.message || "Failed to fetch printer data";
                setError(errorMessage);
                return;
            }

            if (result.data && result.data.docs) {
                setPrinters(result.data.docs);
                setTotalDocs(result.data.totalDocs || 0);
                setTotalPages(result.data.totalPages || 0);
                setCurrentPage(result.data.page || 1);
            } else {
                setError("Invalid printer data format");
            }
        } catch (err) {
            console.error("❌ Error fetching printers:", err);

            let errorMessage = "Failed to fetch printer data";

            if (err instanceof Error) {
                if (err.message.includes("fetch")) {
                    errorMessage =
                        "Network error. Please check your connection.";
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [offset, limit, enabled]);

    useEffect(() => {
        if (enabled) {
            fetchPrinters();
        }
    }, [fetchPrinters, enabled]);

    return {
        printers,
        totalDocs,
        totalPages,
        currentPage,
        isLoading,
        error,
        refetch: fetchPrinters,
        isSessionExpired: isSessionExpiredState,
    };
};
