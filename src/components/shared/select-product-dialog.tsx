// components/shared/select-product-dialog.tsx - FIXED STYLING FOR ALL COLUMNS
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, X, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "./pagination";
import { useStock } from "@/hooks/useStock";
import type { StockData } from "@/types/stock";

interface SelectProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProduct: (product: StockData) => void;
}

export default function SelectProductDialog({
    isOpen,
    onClose,
    onSelectProduct,
}: SelectProductDialogProps) {
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [apiParams, setApiParams] = useState({
        offset: 0,
        limit: 10,
        search: "",
    });

    // Auto focus ref for search input
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { stockList, isLoading, error, totalPages, totalDocs, refetch } =
        useStock(apiParams);

    const pageSizeOptions = [5, 10, 25, 50, 100];

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setPageSize(10);
            setApiParams({ offset: 0, limit: 10, search: "" });
            setSearchInput("");
            setSearchTerm("");
            setIsSearchActive(false);

            // Auto focus to search input when dialog opens
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const trimmedSearch = searchInput.trim();

        if (trimmedSearch.length >= 3 || trimmedSearch.length === 0) {
            const timeoutId = setTimeout(() => {
                setSearchTerm(trimmedSearch);
                setIsSearchActive(trimmedSearch !== "");
                setCurrentPage(1);
                setApiParams({
                    offset: 0,
                    limit: pageSize,
                    search: trimmedSearch,
                });
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [searchInput, pageSize]);

    const handleSearchReset = () => {
        setSearchInput("");
        setSearchTerm("");
        setIsSearchActive(false);
        setCurrentPage(1);
        setApiParams({ offset: 0, limit: pageSize, search: "" });
    };

    const handleSelectProduct = (product: StockData) => {
        onSelectProduct(product);
        onClose();
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > (totalPages || 1)) return;

        setCurrentPage(page);
        const offset = (page - 1) * pageSize;
        setApiParams({
            offset,
            limit: pageSize,
            search: searchTerm,
        });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        setApiParams({
            offset: 0,
            limit: newPageSize,
            search: searchTerm,
        });
        setIsPageSizeOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-4xl max-h-[98vh] flex flex-col shadow-2xl p-5">
                <div className="flex items-center justify-between mb-5 border-gray-200">
                    <h2 className="text-2xl font-semibold text-black">
                        Select Product
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-5 flex flex-col flex-1 min-h-0">
                    <div className="mb-5 border-gray-200">
                        <div className="relative flex gap-3">
                            <div className="relative flex-1">
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search SKU or Product Name (min 3 characters)"
                                    className="pl-10 bg-[#F5F5F5] h-12 border-none"
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                />
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="h-12 px-4 bg-[#003DF6] hover:bg-[#003DF6] text-white hover:text-white hover:scale-105 transition-all"
                            >
                                <Clock size={16} className="mr-2" />
                                History
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-[#F5F5F5]">
                        <div className="flex-1 overflow-auto min-h-0 max-h-[900px] rounded-2xl">
                            <table className="w-full border-collapse rounded-lg overflow-hidden">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#F5F5F5] border-b border-gray-200">
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] first:rounded-tl-lg">
                                            SKU
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[200px]">
                                            Product Name
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px]">
                                            Dept
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px]">
                                            UOM
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                                            HJ Ecer
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                                            HJ Swalayan
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px]">
                                            HJ Perpack
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[50px]">
                                            Isi
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[50px]">
                                            Strip
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px]">
                                            Qbbs
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[120px]">
                                            Barcode
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px]">
                                            Start Date
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px]">
                                            End Date
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px]">
                                            Promo No
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] last:rounded-tr-lg">
                                            Promo Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={15}
                                                className="text-center py-20"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-gray-600">
                                                        Loading products...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td
                                                colSpan={15}
                                                className="text-center py-20"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-red-500 text-center mb-4">
                                                        <p className="font-medium">
                                                            Error loading
                                                            products
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {error}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            refetch()
                                                        }
                                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : stockList.length > 0 ? (
                                        stockList.map((product, index) => (
                                            <tr
                                                key={product.kode_brg}
                                                className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                                    index ===
                                                    stockList.length - 1
                                                        ? "last:border-b-0"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleSelectProduct(product)
                                                }
                                            >
                                                <td
                                                    className={`h-[48px] px-4 text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis ${
                                                        index ===
                                                        stockList.length - 1
                                                            ? "first:rounded-bl-lg"
                                                            : ""
                                                    }`}
                                                >
                                                    {product.kode_brg}
                                                </td>
                                                <td
                                                    className="h-[48px] px-4 text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={product.nama_brg}
                                                >
                                                    {product.nama_brg}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.id_dept}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.satuan}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    Rp{" "}
                                                    {product.hj_ecer?.toLocaleString(
                                                        "id-ID"
                                                    ) || 0}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    Rp{" "}
                                                    {product.hj_ecer?.toLocaleString(
                                                        "id-ID"
                                                    ) || 0}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    Rp{" "}
                                                    {product.hj_ecer?.toLocaleString(
                                                        "id-ID"
                                                    ) || 0}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.isi}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.strip}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm font-medium text-green-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.q_bbs || 0}
                                                </td>
                                                <td
                                                    className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={product.barcode}
                                                >
                                                    {product.barcode || "-"}
                                                </td>
                                                <td
                                                    className={`h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis ${
                                                        index ===
                                                        stockList.length - 1
                                                            ? "last:rounded-br-lg"
                                                            : ""
                                                    }`}
                                                >
                                                    -
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    -
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    -
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    -
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={15}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                {isSearchActive
                                                    ? "No products found for your search."
                                                    : "No products found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer with pagination and page size selector */}
                    {stockList.length > 0 && (
                        <div className="mt-5 flex justify-between items-center flex-shrink-0">
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
                                        from {totalDocs || 0}
                                    </span>
                                </div>
                                {/* <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalDocs || 0)} of{" "}
                  {totalDocs || 0} products
                </div> */}
                            </div>
                            {totalPages && totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    size="sm"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
