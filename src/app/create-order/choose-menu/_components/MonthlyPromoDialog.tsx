"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import Pagination from "@/components/shared/pagination";
import { usePromo } from "@/hooks/usePromo";
import type { PromoData, PromoDisplayData } from "@/types/promo";

interface DateRange {
    from?: Date;
    to?: Date;
}

interface MonthlyPromoDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MonthlyPromoDialog({
    isOpen,
    onClose,
}: MonthlyPromoDialogProps) {
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [appliedDateRange, setAppliedDateRange] = useState<
        DateRange | undefined
    >(undefined);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const pageSizeOptions = [5, 10, 25, 50, 100];
    const offset = (currentPage - 1) * pageSize;
    const {
        promoList,
        isLoading,
        error,
        refetch,
        totalPages = 0,
        totalDocs = 0,
    } = usePromo({
        limit: pageSize,
        offset,
    });

    const transformedPromoData: PromoDisplayData[] = promoList.map(
        (item: PromoData) => ({
            id: `${item.no_promo}-${item.kd_brgdg}` || `promo-${Math.random()}`,
            promo_id: item.no_promo || "",
            product_name: item.nm_brgdg || "Unknown Product",
            promo_type: item.jenis_promo?.nm_promo || "Standard Promo",
            start_date: item.tgl_awal_promo
                ? new Date(item.tgl_awal_promo).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                  })
                : "",
            end_date: item.tgl_akhir_promo
                ? new Date(item.tgl_akhir_promo).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                  })
                : "",
            disc_promo: item.disc_promo || 0,
            harga_sebelum: item.harga_sebelum || 0,
            harga_sesudah: item.harga_sesudah || 0,
        })
    );

    const filteredData = React.useMemo(() => {
        let data = transformedPromoData;

        if (searchTerm) {
            data = data.filter((promo) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    promo.promo_id.toLowerCase().includes(searchLower) ||
                    promo.product_name.toLowerCase().includes(searchLower) ||
                    promo.promo_type.toLowerCase().includes(searchLower)
                );
            });
        }

        if (appliedDateRange?.from || appliedDateRange?.to) {
            data = data.filter((promo) => {
                if (!promo.start_date || !promo.end_date) return false;

                const parseDate = (dateStr: string): Date => {
                    const [day, month, year] = dateStr.split("/").map(Number);
                    return new Date(year, month - 1, day);
                };

                const promoStartDate = parseDate(promo.start_date);
                const promoEndDate = parseDate(promo.end_date);

                let matchesRange = true;

                if (appliedDateRange.from) {
                    matchesRange =
                        matchesRange && promoEndDate >= appliedDateRange.from;
                }

                if (appliedDateRange.to) {
                    matchesRange =
                        matchesRange && promoStartDate <= appliedDateRange.to;
                }

                return matchesRange;
            });
        }

        return data;
    }, [transformedPromoData, searchTerm, appliedDateRange]);

    const displayData =
        searchTerm || appliedDateRange?.from || appliedDateRange?.to
            ? filteredData
            : transformedPromoData;
    const displayTotalPages =
        searchTerm || appliedDateRange?.from || appliedDateRange?.to
            ? Math.ceil(filteredData.length / pageSize)
            : totalPages;
    const displayTotalDocs =
        searchTerm || appliedDateRange?.from || appliedDateRange?.to
            ? filteredData.length
            : totalDocs;

    useEffect(() => {
        const trimmedSearch = searchInput.trim();

        if (trimmedSearch.length >= 3) {
            const timeoutId = setTimeout(() => {
                setSearchTerm(trimmedSearch);
                setCurrentPage(1);
            }, 300);

            return () => clearTimeout(timeoutId);
        } else if (trimmedSearch.length === 0) {
            setSearchTerm("");
            setCurrentPage(1);
        }
    }, [searchInput]);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setSearchInput("");
            setSearchTerm("");
            setAppliedDateRange(undefined);
            setIsPageSizeOpen(false);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handlePageChange = (page: number) => {
        if (searchTerm || appliedDateRange?.from || appliedDateRange?.to) {
            const maxPages = Math.ceil(filteredData.length / pageSize);
            if (page < 1 || page > maxPages) return;
        } else {
            if (page < 1 || page > totalPages) return;
        }
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        setIsPageSizeOpen(false);
    };

    const handleSearchReset = () => {
        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setAppliedDateRange(range);
        setCurrentPage(1);
        console.log("Date range applied:", range);
    };

    const handleClose = () => {
        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
        setPageSize(10);
        setAppliedDateRange(undefined);
        setIsPageSizeOpen(false);
        onClose();
    };

    const handleRowClick = (promo: PromoDisplayData) => {
        console.log("Promo selected:", promo);
    };

    const handleRetry = () => {
        refetch();
    };

    const formatCurrency = (amount: number): string => {
        if (amount == null || isNaN(Number(amount))) {
            return "Rp 0";
        }
        try {
            const numAmount = Number(amount);
            return `Rp ${numAmount.toLocaleString("id-ID")}`;
        } catch (error) {
            return "Rp 0";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Monthly Promo Highlights
                    </h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Promo ID or Product Name (min 3 characters)"
                                className="pl-10 pr-10 bg-[#F5F5F5] h-12 border-none"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            {searchInput && (
                                <button
                                    onClick={handleSearchReset}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <DateRangePicker
                            value={appliedDateRange}
                            onChange={handleDateRangeChange}
                            placeholder="Select date range"
                        />
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex-shrink-0">
                            <div className="text-red-700 text-sm">
                                Error loading promo data: {error}
                                <button
                                    onClick={handleRetry}
                                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            ref={tableContainerRef}
                            className="h-full w-full overflow-auto"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#3b82f6 #f1f5f9",
                                maxHeight: "400px",
                            }}
                        >
                            <table className="w-full border-collapse min-w-[1400px]">
                                <thead className="sticky top-0 z-10 bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Promo ID
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[300px]">
                                            Product Name
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[150px]">
                                            Promo Type
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[100px]">
                                            Start Date
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[100px]">
                                            End Date
                                        </th>
                                        <th className="text-center h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[80px]">
                                            Discount %
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Before Price
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            After Price
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center py-20"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-gray-600">
                                                        Loading promos...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : displayData.length > 0 ? (
                                        displayData.map((promo, index) => (
                                            <tr
                                                key={promo.id}
                                                className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                                    index % 2 === 1
                                                        ? "bg-gray-50/30"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleRowClick(promo)
                                                }
                                            >
                                                <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                                                    {promo.promo_id}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900">
                                                    {promo.product_name}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {promo.promo_type}
                                                    </span>
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {promo.start_date}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {promo.end_date}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-center font-medium text-green-600">
                                                    {promo.disc_promo}%
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {formatCurrency(
                                                        promo.harga_sebelum
                                                    )}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm font-medium text-green-600">
                                                    {formatCurrency(
                                                        promo.harga_sesudah
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                {searchTerm &&
                                                searchInput.trim().length >= 3
                                                    ? "No promos found for your search."
                                                    : searchTerm &&
                                                      searchInput.trim()
                                                          .length > 0 &&
                                                      searchInput.trim()
                                                          .length < 3
                                                    ? "Please enter at least 3 characters to search."
                                                    : "No promos available."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {displayData.length > 0 && (
                        <div className="mt-4 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Show
                                    </span>
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setIsPageSizeOpen(
                                                    !isPageSizeOpen
                                                )
                                            }
                                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                                        >
                                            {pageSize}
                                            <ChevronDown size={14} />
                                        </button>
                                        {isPageSizeOpen && (
                                            <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                                                {pageSizeOptions.map(
                                                    (option) => (
                                                        <button
                                                            key={option}
                                                            onClick={() =>
                                                                handlePageSizeChange(
                                                                    option
                                                                )
                                                            }
                                                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                                option ===
                                                                pageSize
                                                                    ? "bg-blue-50 text-blue-600"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        from {displayTotalDocs || 0}
                                    </span>
                                </div>
                            </div>
                            {displayTotalPages && displayTotalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={displayTotalPages}
                                    onPageChange={handlePageChange}
                                    size="sm"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .table-scroll-container {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 #f1f5f9;
                }

                .table-scroll-container::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .table-scroll-container::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }

                .table-scroll-container::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 4px;
                    border: 1px solid #f1f5f9;
                }

                .table-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: #2563eb;
                }

                .table-scroll-container::-webkit-scrollbar-corner {
                    background: #f1f5f9;
                }
            `}</style>
        </div>
    );
}
