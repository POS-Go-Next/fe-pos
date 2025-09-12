// components/shared/select-product-dialog.tsx - FIXED SYNTAX ERRORS
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStock } from "@/hooks/useStock";
import type { StockData } from "@/types/stock";
import { ChevronDown, Clock, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Pagination from "./pagination";
import ProductHistoryDialog from "./product-history-dialog";
import StockWarningDialog from "./stock-warning-dialog";

interface SelectProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProduct: (product: StockData) => void;
    initialSearchQuery?: string;
    autoSearch?: boolean;
}

export default function SelectProductDialog({
    isOpen,
    onClose,
    onSelectProduct,
    initialSearchQuery = "",
    autoSearch = false,
}: SelectProductDialogProps) {
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [apiParams, setApiParams] = useState({
        offset: 0,
        limit: 10,
        search: "",
    });

    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [selectedProductForHistory, setSelectedProductForHistory] =
        useState<string>("");
    const [selectedProductCodeForHistory, setSelectedProductCodeForHistory] =
        useState<string>("");

    // Stock Warning Dialog States
    const [stockWarningDialog, setStockWarningDialog] = useState({
        isOpen: false,
        productName: "",
        warningType: "out-of-stock" as "out-of-stock" | "insufficient-stock",
        availableStock: 0,
        requestedQuantity: 0,
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const { stockList, isLoading, error, totalPages, totalDocs, refetch } =
        useStock(apiParams);

    const pageSizeOptions = [5, 10, 25, 50, 100];

    const scrollToSelectedRow = (index: number) => {
        if (!tableContainerRef.current) return;
        const rows = tableContainerRef.current.querySelectorAll("tbody tr");
        const selectedRow = rows[index];
        if (selectedRow) {
            selectedRow.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isTypingInSearch =
                document.activeElement === searchInputRef.current &&
                (e.key.length === 1 ||
                    e.key === "Backspace" ||
                    e.key === "Delete");

            if (isTypingInSearch) return;

            switch (e.key) {
                case "PageDown":
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => {
                        if (prevIndex === -1 && stockList.length > 0) {
                            scrollToSelectedRow(0);
                            return 0;
                        }
                        const newIndex = Math.min(
                            prevIndex + 1,
                            stockList.length - 1
                        );
                        scrollToSelectedRow(newIndex);
                        return newIndex;
                    });
                    break;

                case "PageUp":
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => {
                        if (prevIndex === -1 && stockList.length > 0) {
                            scrollToSelectedRow(0);
                            return 0;
                        }
                        const newIndex = Math.max(prevIndex - 1, 0);
                        scrollToSelectedRow(newIndex);
                        return newIndex;
                    });
                    break;

                case "Enter":
                    e.preventDefault();
                    if (
                        selectedIndex >= 0 &&
                        selectedIndex < stockList.length
                    ) {
                        handleSelectProduct(stockList[selectedIndex]);
                    }
                    break;

                case "Home":
                    e.preventDefault();
                    if (stockList.length > 0) {
                        setSelectedIndex(0);
                        scrollToSelectedRow(0);
                    }
                    break;

                case "End":
                    e.preventDefault();
                    if (stockList.length > 0) {
                        const lastIndex = stockList.length - 1;
                        setSelectedIndex(lastIndex);
                        scrollToSelectedRow(lastIndex);
                    }
                    break;

                case "Escape":
                    e.preventDefault();
                    handleClose();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, stockList, selectedIndex]);

    useEffect(() => {
        if (stockList.length > 0) {
            setSelectedIndex(0);
        } else {
            setSelectedIndex(-1);
        }
    }, [stockList]);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setPageSize(10);

            if (initialSearchQuery && initialSearchQuery.trim().length >= 3) {
                setSearchInput(initialSearchQuery);
                setSearchTerm(initialSearchQuery.trim());
                setIsSearchActive(true);
                setApiParams({
                    offset: 0,
                    limit: 10,
                    search: initialSearchQuery.trim(),
                });
            } else {
                setApiParams({ offset: 0, limit: 10, search: "" });
                setSearchInput("");
                setSearchTerm("");
                setIsSearchActive(false);
            }

            setIsHistoryDialogOpen(false);
            setSelectedProductForHistory("");
            setSelectedProductCodeForHistory("");
            setStockWarningDialog({
                isOpen: false,
                productName: "",
                warningType: "out-of-stock",
                availableStock: 0,
                requestedQuantity: 0,
            });

            setTimeout(() => {
                searchInputRef.current?.focus();
                if (initialSearchQuery && searchInputRef.current) {
                    searchInputRef.current.setSelectionRange(
                        initialSearchQuery.length,
                        initialSearchQuery.length
                    );
                }
            }, 100);
        }
    }, [isOpen, initialSearchQuery]);

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

    // CRITICAL: Stock validation - only block products with q_akhir === 0
    const handleSelectProduct = (product: StockData) => {
        console.log("🔥 SELECTING PRODUCT:", {
            name: product.nama_brg,
            code: product.kode_brg,
            stock: product.q_akhir,
        });

        // ONLY block if stock is exactly 0
        if (product.q_akhir === 0) {
            console.log("❌ BLOCKED: Stock is 0, showing warning");
            setStockWarningDialog({
                isOpen: true,
                productName: product.nama_brg,
                warningType: "out-of-stock",
                availableStock: 0,
                requestedQuantity: 1,
            });
            return; // Stop execution - don't add to cart
        }

        // Allow selection for all other cases
        console.log("✅ ALLOWED: Adding to cart");
        onSelectProduct(product);
        handleClose();
    };

    const handleRowClick = (product: StockData, index: number) => {
        setSelectedIndex(index);
        handleSelectProduct(product);
    };

    const handleRowHover = (index: number) => {
        setSelectedIndex(index);
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
            handleClose();
        }
    };

    // UPDATED: History click handler to pass both name and code
    const handleHistoryClick = () => {
        if (selectedIndex >= 0 && stockList[selectedIndex]) {
            const selectedProduct = stockList[selectedIndex];
            setSelectedProductForHistory(selectedProduct.nama_brg);
            setSelectedProductCodeForHistory(selectedProduct.kode_brg);
        } else if (searchTerm.trim()) {
            setSelectedProductForHistory(searchTerm.trim());
            setSelectedProductCodeForHistory("");
        } else {
            setSelectedProductForHistory("Product History");
            setSelectedProductCodeForHistory("");
        }
        setIsHistoryDialogOpen(true);
    };

    const handleHistoryDialogClose = () => {
        setIsHistoryDialogOpen(false);
        setSelectedProductForHistory("");
        setSelectedProductCodeForHistory("");
    };

    const handleStockWarningClose = () => {
        setStockWarningDialog((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    const handleClose = () => {
        setSearchInput("");
        setSearchTerm("");
        setIsSearchActive(false);
        setCurrentPage(1);
        setSelectedIndex(-1);
        setApiParams({ offset: 0, limit: 10, search: "" });
        setIsHistoryDialogOpen(false);
        setSelectedProductForHistory("");
        setSelectedProductCodeForHistory("");
        setStockWarningDialog({
            isOpen: false,
            productName: "",
            warningType: "out-of-stock",
            availableStock: 0,
            requestedQuantity: 0,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-4xl max-h-[98vh] flex flex-col shadow-2xl p-5">
                    <div className="flex items-center justify-between mb-5 border-gray-200">
                        <h2 className="text-2xl font-semibold text-black">
                            Select Product
                        </h2>
                        <button
                            onClick={handleClose}
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
                                        placeholder="Search SKU or Product Name (min 3 characters) - Use PageUp/PageDown to navigate"
                                        className="pl-10 pr-10 bg-[#F5F5F5] h-12 border-none"
                                        value={searchInput}
                                        onChange={(e) =>
                                            setSearchInput(e.target.value)
                                        }
                                        onKeyDown={handleKeyPress}
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
                                <Button
                                    variant="outline"
                                    onClick={handleHistoryClick}
                                    className="h-12 px-4 bg-[#003DF6] hover:bg-[#003DF6] text-white hover:text-white hover:scale-105 transition-all"
                                    title="View Product History"
                                >
                                    <Clock size={16} className="mr-2" />
                                    History
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-[#F5F5F5] overflow-hidden">
                            <div
                                ref={tableContainerRef}
                                className="flex-1 overflow-auto"
                                style={{
                                    maxHeight: "400px",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#3b82f6 #f1f5f9",
                                }}
                            >
                                <table
                                    ref={tableRef}
                                    className="w-full border-collapse"
                                >
                                    <thead className="sticky top-0 z-20 bg-[#F5F5F5]">
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] bg-[#F5F5F5]">
                                                SKU
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[200px] bg-[#F5F5F5]">
                                                Product Name
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px] bg-[#F5F5F5]">
                                                Dept
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px] bg-[#F5F5F5]">
                                                UOM
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                                HJ Ecer
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                                HJ Swalayan
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                                HJ Perpack
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[50px] bg-[#F5F5F5]">
                                                Isi
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[50px] bg-[#F5F5F5]">
                                                Strip
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px] bg-[#F5F5F5]">
                                                Qbbs
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[60px] bg-[#F5F5F5]">
                                                Stock
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[120px] bg-[#F5F5F5]">
                                                Barcode
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] bg-[#F5F5F5]">
                                                Start Date
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] bg-[#F5F5F5]">
                                                End Date
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[80px] bg-[#F5F5F5]">
                                                Promo No
                                            </th>
                                            <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 whitespace-nowrap min-w-[100px] bg-[#F5F5F5]">
                                                Promo Type
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {isLoading ? (
                                            <tr>
                                                <td
                                                    colSpan={16}
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
                                                    colSpan={16}
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
                                            stockList.map((product, index) => {
                                                // CRITICAL: Check if product is out of stock (q_akhir === 0)
                                                const isOutOfStock =
                                                    product.q_akhir === 0;

                                                const rowClassName = `border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                                                    isOutOfStock
                                                        ? "bg-red-50 hover:bg-red-100 opacity-70"
                                                        : index ===
                                                          selectedIndex
                                                        ? "bg-blue-100 border-blue-300 shadow-sm"
                                                        : "hover:bg-blue-50"
                                                }`;

                                                return (
                                                    <tr
                                                        key={product.kode_brg}
                                                        className={rowClassName}
                                                        onClick={() =>
                                                            handleRowClick(
                                                                product,
                                                                index
                                                            )
                                                        }
                                                        onMouseEnter={() =>
                                                            handleRowHover(
                                                                index
                                                            )
                                                        }
                                                        title={
                                                            isOutOfStock
                                                                ? "Produk ini stoknya habis"
                                                                : ""
                                                        }
                                                    >
                                                        <td className="h-[48px] px-4 text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {product.kode_brg}
                                                        </td>
                                                        <td
                                                            className={`h-[48px] px-4 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${
                                                                isOutOfStock
                                                                    ? "text-red-600"
                                                                    : "text-gray-900"
                                                            }`}
                                                            title={
                                                                product.nama_brg
                                                            }
                                                        >
                                                            {product.nama_brg}
                                                            {/* CRITICAL: Show HABIS label for out of stock products */}
                                                            {isOutOfStock && (
                                                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">
                                                                    HABIS
                                                                </span>
                                                            )}
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
                                                        {/* FIXED: Stock column with proper q_akhir display */}
                                                        <td
                                                            className={`h-[48px] px-4 text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis ${
                                                                product.q_akhir ===
                                                                0
                                                                    ? "text-red-600"
                                                                    : product.q_akhir !=
                                                                          null &&
                                                                      product.q_akhir <
                                                                          10
                                                                    ? "text-orange-600"
                                                                    : "text-green-600"
                                                            }`}
                                                        >
                                                            {/* Display actual q_akhir value with proper formatting */}
                                                            {product.q_akhir !=
                                                            null
                                                                ? product.q_akhir.toLocaleString(
                                                                      "id-ID"
                                                                  )
                                                                : "N/A"}
                                                            {product.q_akhir ===
                                                                0 && (
                                                                <span className="ml-1 text-xs">
                                                                    (HABIS)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td
                                                            className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                                                            title={
                                                                product.barcode
                                                            }
                                                        >
                                                            {product.barcode ||
                                                                "-"}
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
                                                        <td className="h-[48px] px-4 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                                            -
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={16}
                                                    className="p-8 text-center text-gray-500"
                                                >
                                                    {isSearchActive
                                                        ? `No products found for "${searchTerm}".`
                                                        : "No products found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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

            {/* UPDATED: Pass both productName and productCode to ProductHistoryDialog */}
            <ProductHistoryDialog
                isOpen={isHistoryDialogOpen}
                onClose={handleHistoryDialogClose}
                productName={selectedProductForHistory}
                productCode={selectedProductCodeForHistory}
            />

            <StockWarningDialog
                isOpen={stockWarningDialog.isOpen}
                onClose={handleStockWarningClose}
                productName={stockWarningDialog.productName}
                warningType={stockWarningDialog.warningType}
                availableStock={stockWarningDialog.availableStock}
                requestedQuantity={stockWarningDialog.requestedQuantity}
            />

            {/* UPDATED: Custom Scrollbar Styles - Same as History Product */}
            <style jsx>{`
                div[ref] {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 #f1f5f9;
                }

                div[ref]::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                div[ref]::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }

                div[ref]::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 4px;
                    border: 1px solid #f1f5f9;
                }

                div[ref]::-webkit-scrollbar-thumb:hover {
                    background: #2563eb;
                }

                div[ref]::-webkit-scrollbar-corner {
                    background: #f1f5f9;
                }
            `}</style>
        </>
    );
}
