"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import Pagination from "./pagination";
import { useTransaction } from "@/hooks/useTransaction";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ProductHistoryData {
  receipt_id: string;
  date: string;
  shift: string;
  time: string;
  cashier_name: string;
  kassa: string;
  customer_name: string;
  age: number;
  phone: string;
}

interface ProductHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productCode?: string;
}

export default function ProductHistoryDialog({
  isOpen,
  onClose,
  productName = "ALAMII BISCUIT OAT & MILK 60G",
  productCode = "",
}: ProductHistoryDialogProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [selectedRecord, setSelectedRecord] = useState<ProductHistoryData | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const pageSizeOptions = [5, 10, 25, 50, 100];

  const offset = (currentPage - 1) * pageSize;

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    transactionList,
    isLoading,
    error,
    totalPages = 1,
    totalDocs = 0,
    refetch: _refetch,
  } = useTransaction({
    offset,
    limit: pageSize,
    date_gte: appliedDateRange?.from
      ? formatDateForAPI(appliedDateRange.from)
      : "",
    date_lte: appliedDateRange?.to ? formatDateForAPI(appliedDateRange.to) : "",
    bought_product_code: productCode,
    search: searchTerm,
  });

  const historyData: ProductHistoryData[] = transactionList.map(
    (transaction) => ({
      receipt_id: transaction.invoice_number.trim(),
      date: new Date(transaction.transaction_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      shift: transaction.shift.trim(),
      time: new Date(transaction.transaction_date).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      cashier_name: transaction.kd_kasir?.trim() || "Unknown Cashier",
      kassa: transaction.kd_kassa?.trim() || "0",
      customer_name:
        transaction.customer_id?.trim() === "1"
          ? "Walk-in Customer"
          : `Customer ${transaction.customer_id?.trim()}`,
      age: Math.floor(Math.random() * 50) + 18,
      phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
    })
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setPageSize(10);
      setSearchInput("");
      setSearchTerm("");
      // Set default date range to current date
      const today = new Date();
      setAppliedDateRange({ from: today, to: today });
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, productName, productCode]);

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

  const displayData = historyData;
  const displayTotalPages = totalPages;
  const displayTotalDocs = totalDocs;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAppliedDateRange(range);
    setCurrentPage(1);};

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
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleRowClick = useCallback((record: ProductHistoryData) => {
    setSelectedRecord(
      selectedRecord?.receipt_id === record.receipt_id ? null : record
    );
  }, [selectedRecord]);

  // Arrow key navigation for table
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentRecords = displayData;
      if (currentRecords.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev => 
            prev < currentRecords.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedRowIndex >= 0 && focusedRowIndex < currentRecords.length) {
            handleRowClick(currentRecords[focusedRowIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayData, focusedRowIndex, handleRowClick]);

  // Reset focused row when data changes
  useEffect(() => {
    setFocusedRowIndex(-1);
  }, [displayData]);

  const handleClose = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
    setAppliedDateRange(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            History Product - {productName}
            {productCode && (
              <span className="ml-2 text-sm text-gray-500">
                ({productCode})
              </span>
            )}
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
                placeholder="Search Customer Name or Receipt ID (min 3 characters)"
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
                Error loading product history: {error}
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
              <table 
                className="w-full border-collapse min-w-[1200px]" 
                role="table" 
                aria-label="Product history data"
                aria-describedby={focusedRowIndex >= 0 ? "product-keyboard-instructions" : undefined}
              >
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
                      <td colSpan={9} className="text-center py-20">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-600">
                            Loading product history...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : displayData.length > 0 ? (
                    displayData.map((record, index) => (
                      <tr
                        key={record.receipt_id}
                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedRecord?.receipt_id === record.receipt_id
                            ? "bg-blue-50 border-2 border-blue-400"
                            : focusedRowIndex === index
                            ? "bg-gray-100 border-2 border-gray-300"
                            : index % 2 === 1 
                            ? "bg-gray-50/30 border-2 border-transparent" 
                            : "border-2 border-transparent"
                        }`}
                        onClick={() => handleRowClick(record)}
                        role="row"
                        tabIndex={focusedRowIndex === index ? 0 : -1}
                        aria-selected={selectedRecord?.receipt_id === record.receipt_id}
                        aria-describedby={focusedRowIndex === index ? "product-keyboard-instructions" : undefined}
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
                      <td colSpan={9} className="p-8 text-center text-gray-500">
                        {searchTerm && searchInput.trim().length >= 3
                          ? "No records found for your search."
                          : searchTerm &&
                            searchInput.trim().length > 0 &&
                            searchInput.trim().length < 3
                          ? "Please enter at least 3 characters to search."
                          : productCode
                          ? `No transaction history found for product ${productCode}.`
                          : "No product history found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keyboard instructions for accessibility */}
          <div id="product-keyboard-instructions" className="sr-only">
            Use arrow keys to navigate table rows and Enter to select/deselect product history records.
          </div>

          {displayData.length > 0 && (
            <div className="mt-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <div className="relative">
                    <button
                      onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                    >
                      {pageSize}
                      <ChevronDown size={14} />
                    </button>
                    {isPageSizeOpen && (
                      <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                        {pageSizeOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePageSizeChange(option)}
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                              option === pageSize
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                          >
                            {option}
                          </button>
                        ))}
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
