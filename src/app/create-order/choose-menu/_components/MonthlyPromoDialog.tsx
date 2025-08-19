// app/create-order/choose-menu/_components/MonthlyPromoDialog.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/shared/pagination";
import { usePromo } from "@/hooks/usePromo";
import type { PromoDisplayData } from "@/types/promo";

interface MonthlyPromoDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MonthlyPromoDialog({
    isOpen,
    onClose,
}: MonthlyPromoDialogProps) {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const pageSizeOptions = [5, 10, 25, 50, 100];

    // Calculate offset for API call
    const offset = (currentPage - 1) * pageSize;

    // Use the promo hook - send only offset and limit
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
        // Remove search, sort_by, sort_order to match API expectation
    });

    // Transform API data to display format
    const transformedPromoData: PromoDisplayData[] = promoList.map(
        (item, index) => ({
            id: item.id || `promo-${index}`,
            promo_id:
                item.promo_code ||
                item.code ||
                `PRO${String(index + 1).padStart(5, "0")}`,
            product_name:
                item.product_name ||
                item.name ||
                item.title ||
                "Unknown Product",
            promo_type: item.promo_type || item.type || "Standard Promo",
            start_date:
                item.start_date ||
                item.startDate ||
                new Date().toLocaleDateString("en-GB"),
            end_date:
                item.end_date ||
                item.endDate ||
                new Date().toLocaleDateString("en-GB"),
        })
    );

    // Filter data locally since API doesn't support search
    const filteredData = transformedPromoData.filter((promo) => {
        if (!debouncedSearch.trim()) return true;
        const searchLower = debouncedSearch.toLowerCase();
        return (
            promo.promo_id.toLowerCase().includes(searchLower) ||
            promo.product_name.toLowerCase().includes(searchLower) ||
            promo.promo_type.toLowerCase().includes(searchLower)
        );
    });

    // Debounce search input - for local filtering only since API doesn't support search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            // Don't reset page since we're filtering locally
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setSearchInput("");
            setDebouncedSearch("");
            setIsPageSizeOpen(false);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        setIsPageSizeOpen(false);
    };

    const handleSearchReset = () => {
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
    };

    const handleClose = () => {
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
        setPageSize(10);
        setIsPageSizeOpen(false);
        onClose();
    };

    const handleRowClick = (promo: PromoDisplayData) => {
        console.log("🎯 Promo selected:", promo);
        // Add any logic for selecting promo
    };

    const handleRetry = () => {
        refetch();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
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

                {/* Search Section */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="relative max-w-md">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search SKU or Product Name"
                            className="pl-10 bg-gray-50 border-gray-200 h-10"
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="text-red-700 text-sm">
                                    <strong>API Error:</strong> {error}
                                    <button
                                        onClick={handleRetry}
                                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div
                                ref={tableContainerRef}
                                className="overflow-auto max-h-[400px]"
                            >
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10 bg-gray-50">
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 w-[60px]">
                                                No.
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                                Promo ID
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[250px]">
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
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white">
                                        {isLoading ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
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
                                        ) : filteredData.length > 0 ? (
                                            filteredData.map((promo, index) => (
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
                                                    <td className="h-[48px] px-4 text-sm text-gray-600">
                                                        {(currentPage - 1) *
                                                            pageSize +
                                                            index +
                                                            1}
                                                    </td>
                                                    <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                                                        {promo.promo_id}
                                                    </td>
                                                    <td className="h-[48px] px-4 text-sm text-gray-900">
                                                        {promo.product_name}
                                                    </td>
                                                    <td className="h-[48px] px-4 text-sm">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                promo.promo_type.includes(
                                                                    "Buy"
                                                                )
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-blue-100 text-blue-800"
                                                            }`}
                                                        >
                                                            {promo.promo_type}
                                                        </span>
                                                    </td>
                                                    <td className="h-[48px] px-4 text-sm text-gray-600">
                                                        {promo.start_date}
                                                    </td>
                                                    <td className="h-[48px] px-4 text-sm text-gray-600">
                                                        {promo.end_date}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="p-8 text-center text-gray-500"
                                                >
                                                    {debouncedSearch
                                                        ? `No promos found for "${debouncedSearch}".`
                                                        : "No promos available."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Footer - Fixed at bottom */}
                    {transformedPromoData.length > 0 && totalPages > 0 && (
                        <div className="border-t border-gray-200 p-6 flex-shrink-0">
                            <div className="flex justify-between items-center">
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
                                            from {totalDocs}
                                        </span>
                                    </div>
                                </div>
                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        size="sm"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
