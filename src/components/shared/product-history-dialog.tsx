// components/shared/product-history-dialog.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Calendar, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "./pagination";
import { useTransaction } from "@/hooks/useTransaction";

interface ProductHistoryData {
    receipt_id: string;
    date: string;
    shift: number;
    time: string;
    cashier_name: string;
    kassa: number;
    customer_name: string;
    age: number;
    phone: string;
}

interface ProductHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
}

export default function ProductHistoryDialog({
    isOpen,
    onClose,
    productName = "ALAMII BISCUIT OAT & MILK 60G",
}: ProductHistoryDialogProps) {
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("06/07/2024");

    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const pageSizeOptions = [5, 10, 25, 50, 100];

    const offset = (currentPage - 1) * pageSize;
    const {
        transactionList,
        isLoading,
        error,
        totalPages = 1,
        totalDocs = 0,
        refetch,
    } = useTransaction({
        offset,
        limit: pageSize,
    });

    const historyData: ProductHistoryData[] = transactionList.map(
        (transaction, index) => ({
            receipt_id: transaction.invoice_number,
            date: new Date(transaction.transaction_date).toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }
            ),
            shift: Math.floor(Math.random() * 3) + 1,
            time: new Date(transaction.transaction_date).toLocaleTimeString(
                "en-GB",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }
            ),
            cashier_name: transaction.cashier || "Unknown Cashier",
            kassa: Math.floor(Math.random() * 50) + 1,
            customer_name: transaction.customer_name || "Walk-in Customer",
            age: Math.floor(Math.random() * 50) + 18,
            phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
        })
    );

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setSearchInput("");
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
        setCurrentPage(1);
    };

    const handleExport = () => {
        console.log("🔄 Exporting product history data...");
    };

    const handleClose = () => {
        setSearchInput("");
        setCurrentPage(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        History Product - {productName}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="flex items-center justify-between gap-4 p-6 border-b border-gray-200">
                    <div className="relative flex-1 max-w-md">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search Customer Name or Receipt ID"
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

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                                {selectedDate}
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="flex items-center gap-2 h-10"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-6">
                    {error && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="text-yellow-700 text-sm">
                                <strong>Note:</strong> {error}
                                <br />
                                <em>
                                    Please check your connection and try again.
                                </em>
                            </div>
                        </div>
                    )}

                    <div className="border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
                        <div
                            ref={tableContainerRef}
                            className="flex-1 overflow-auto"
                        >
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 z-10 bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Receipt ID
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[100px]">
                                            Date
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[60px]">
                                            Shift
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[80px]">
                                            Time
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Cashier Name
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[60px]">
                                            Kassa
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[60px]">
                                            Kassa
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[150px]">
                                            Customer Name
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[60px]">
                                            Age
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Phone Number
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={10}
                                                className="text-center py-20"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-gray-600">
                                                        Loading transaction
                                                        history...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : historyData.length > 0 ? (
                                        historyData.map((record, index) => (
                                            <tr
                                                key={record.receipt_id}
                                                className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                                    index % 2 === 1
                                                        ? "bg-gray-50/30"
                                                        : ""
                                                }`}
                                            >
                                                <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                                                    {record.receipt_id}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.date}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.shift}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.time}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900">
                                                    {record.cashier_name}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.kassa}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.kassa}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900">
                                                    {record.customer_name}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.age}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {record.phone}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={10}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                {searchInput
                                                    ? `No records found for "${searchInput}".`
                                                    : "No transaction history found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {historyData.length > 0 && (
                        <div className="mt-4 flex justify-between items-center">
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
                    )}
                </div>
            </div>
        </div>
    );
}
