"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Search, ChevronDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/shared/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import ReturnTypeDialog from "@/components/shared/return-type-dialog";
import ReturnNoteDialog from "@/components/shared/return-note-dialog";
import { useTransaction } from "@/hooks/useTransaction";
import type { TransactionData } from "@/types/transaction";

interface DateRange {
  from?: Date;
  to?: Date;
}

// Helper function to get today's date range
const getTodayDateRange = (): DateRange => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  return { from: todayStart, to: todayEnd };
};

interface TransactionDetailItem {
  product_code: string;
  product_name: string;
  price: number;
  quantity: number;
  prescription_code?: string;
  sub_total: number;
  nominal_discount: number;
  discount: number;
  service_fee: number;
  misc: number;
  disc_promo: number;
  value_promo: number;
  no_promo?: string;
  promo_type?: string;
  up_selling: string;
  total: number;
  round_up: number;
}

interface TransactionDetailData {
  id: string;
  invoice_number: string;
  customer_id: string;
  doctor_id: number;
  corporate_code: string;
  transaction_type: string;
  transaction_action: string;
  compounded: boolean;
  full_prescription: boolean;
  availability: boolean;
  notes: string;
  transaction_date: string;
  shift: string;
  kd_kasir: string;
  kd_kassa: string;
  retur_reason: string | null;
  confirmation_retur_by: string | null;
  retur_information: string | null;
  cash: number;
  change_cash: number;
  change_cc: number;
  change_dc: number;
  credit_card: number;
  debit_card: number;
  no_cc: string;
  no_dc: string;
  edc_cc: string;
  edc_dc: string;
  publisher_cc: string;
  publisher_dc: string;
  type_cc: string;
  type_dc: string;
  sub_total: number;
  misc: number;
  service_fee: number;
  discount: number;
  promo: number;
  round_up: number;
  grand_total: number;
  items: TransactionDetailItem[];
}

export interface TransactionCorrectionWithReturnType extends TransactionData {
  returnType: "item-based" | "full-return";
  returnReason?: string;
}

interface TransactionCorrectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefetch?: () => void;
  onSelectTransaction?: (transaction: TransactionCorrectionWithReturnType) => void;
}

const TransactionCorrectionDialog: React.FC<TransactionCorrectionDialogProps> = ({
  isOpen,
  onClose,
  onRefetch,
  onSelectTransaction,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const [transactionDetail, setTransactionDetail] =
    useState<TransactionDetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [showReturnTypeDialog, setShowReturnTypeDialog] = useState(false);
  const [showReturnNoteDialog, setShowReturnNoteDialog] = useState(false);
  const [selectedReturnType, setSelectedReturnType] = useState<"item-based" | "full-return">("item-based");
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [isHookEnabled, setIsHookEnabled] = useState(false);

  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >(getTodayDateRange());

  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(5);
  const [isProductPageSizeOpen, setIsProductPageSizeOpen] = useState(false);

  const pageSizeOptions = [5, 10, 25, 50];

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
    refetch: _refetch,
    totalPages = 0,
    totalDocs = 0,
  } = useTransaction({
    limit: pageSize,
    offset,
    date_gte: appliedDateRange?.from
      ? formatDateForAPI(appliedDateRange.from)
      : "",
    date_lte: appliedDateRange?.to ? formatDateForAPI(appliedDateRange.to) : "",
    search: searchTerm,
    sort_by: "tgl_ril",
    sort_order: "desc",
  }, isHookEnabled);

  const fetchTransactionDetail = async (invoiceNumber: string) => {
    try {
      setIsDetailLoading(true);
      setDetailError(null);

      const response = await fetch(
        `/api/transaction/invoice?invoice_number=${encodeURIComponent(
          invoiceNumber.trim()
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      if (data.data) {
        setTransactionDetail(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: unknown) {
      console.error("Error fetching transaction detail:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch transaction detail";
      setDetailError(errorMessage);
      setTransactionDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleTransactionClick = useCallback((transaction: TransactionData) => {
    setSelectedTransaction(transaction);
    setShowReturnTypeDialog(true);
  }, []);

  const handleReturnTypeConfirm = (returnType: "item-based" | "full-return") => {
    setSelectedReturnType(returnType);
    setShowReturnTypeDialog(false);
    setShowReturnNoteDialog(true);
  };

  const handleReturnNoteConfirm = (returnReason: string) => {
    if (selectedTransaction && onSelectTransaction) {
      onSelectTransaction({
        ...selectedTransaction,
        returnType: selectedReturnType,
        returnReason,
      });
    }
    setShowReturnNoteDialog(false);
    setSelectedTransaction(null);
    handleClose();
  };

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshLoading(true);
    try {
      await _refetch();
    } finally {
      setIsRefreshLoading(false);
    }
  }, [_refetch]);

  const handleClose = useCallback(() => {
    onClose();
    // Optional external refetch callback
    if (onRefetch) {
      onRefetch();
    }
  }, [onClose, onRefetch]);

  const handleReturnTypeClose = () => {
    setShowReturnTypeDialog(false);
    setSelectedTransaction(null);
  };

  const handleReturnNoteClose = () => {
    setShowReturnNoteDialog(false);
    setSelectedTransaction(null);
  };

  const transactionItems = transactionDetail?.items || [];
  const itemTotalPages = Math.ceil(transactionItems.length / productPageSize);
  const itemStartIndex = (productCurrentPage - 1) * productPageSize;
  const paginatedItems = transactionItems.slice(
    itemStartIndex,
    itemStartIndex + productPageSize
  );

  useEffect(() => {
    if (isOpen) {
      // First disable the hook to prevent multiple API calls
      setIsHookEnabled(false);
      
      // Reset all state when modal opens
      setCurrentPage(1);
      setPageSize(5);
      setSearchInput("");
      setSearchTerm("");
      setSelectedTransaction(null);
      setTransactionDetail(null);
      setAppliedDateRange(getTodayDateRange());
      setProductCurrentPage(1);
      setProductPageSize(5);
      
      // Re-enable the hook after all state is reset to trigger single API call
      setTimeout(() => setIsHookEnabled(true), 0);
    } else {
      // Disable hook when modal is closed
      setIsHookEnabled(false);
    }
  }, [isOpen]);

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
    if (selectedTransaction) {
      fetchTransactionDetail(selectedTransaction.invoice_number);
      setProductCurrentPage(1);
    } else {
      setTransactionDetail(null);
    }
  }, [selectedTransaction]);

  const displayTransactions = transactionList;
  const displayTotalPages = totalPages;
  const displayTotalDocs = totalDocs;

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTimeForDisplay = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || isNaN(Number(amount))) {
      return "Rp 0";
    }
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  };

  const cleanString = (str: string | null | undefined): string => {
    if (!str || typeof str !== "string") {
      return "";
    }
    return str.trim();
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAppliedDateRange(range);
    setCurrentPage(1);
  };

  const handleRowClick = useCallback((transaction: TransactionData) => {
    setSelectedTransaction(
      selectedTransaction?.invoice_number === transaction.invoice_number
        ? null
        : transaction
    );
  }, [selectedTransaction]);

  // Arrow key navigation for table
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle Ctrl+R for refresh
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        handleManualRefresh();
        return;
      }

      const currentTransactions = displayTransactions;
      if (currentTransactions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev =>
            prev < currentTransactions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedRowIndex >= 0 && focusedRowIndex < currentTransactions.length) {
            const transaction = currentTransactions[focusedRowIndex];
            if (e.shiftKey) {
              // Shift+Enter: Show return type dialog directly
              handleTransactionClick(transaction);
            } else {
              // Enter: Show transaction details
              handleRowClick(transaction);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayTransactions, focusedRowIndex, handleRowClick, handleTransactionClick, handleManualRefresh]);

  // Reset focused row when transactions change
  useEffect(() => {
    setFocusedRowIndex(-1);
  }, [displayTransactions]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setIsPageSizeOpen(false);
  };

  const handleProductPageChange = (page: number) => {
    if (page < 1 || page > itemTotalPages) return;
    setProductCurrentPage(page);
  };

  const handleProductPageSizeChange = (newPageSize: number) => {
    setProductPageSize(newPageSize);
    setProductCurrentPage(1);
    setIsProductPageSizeOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction Correction / Return
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshLoading}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh transaction list"
            >
              <RefreshCw 
                className={`w-4 h-4 text-gray-600 ${isRefreshLoading ? 'animate-spin' : ''}`} 
              />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search Customer Name or Invoice Number (min 3 characters)"
                className="pl-10 bg-[#F5F5F5] border-none h-12"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>

            <DateRangePicker
              value={appliedDateRange}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-700 text-sm">
                Error loading transactions: {error}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F5F5F5] border-b border-gray-200">
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[150px]">
                    Invoice Number
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Date
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Time
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Shift
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Cashier
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Kassa
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                    Grand Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">
                          Loading transactions...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : displayTransactions.length > 0 ? (
                  displayTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.invoice_number}
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${selectedTransaction?.invoice_number ===
                          transaction.invoice_number
                          ? "bg-blue-50 border-2 border-blue-400"
                          : focusedRowIndex === index
                            ? "bg-gray-100 border-2 border-gray-300"
                            : "border-2 border-transparent"
                        }`}
                      onClick={() => handleRowClick(transaction)}
                      role="row"
                      tabIndex={focusedRowIndex === index ? 0 : -1}
                      aria-selected={selectedTransaction?.invoice_number === transaction.invoice_number}
                      aria-describedby={focusedRowIndex === index ? "keyboard-instructions" : undefined}
                    >
                      <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                        {cleanString(transaction.invoice_number)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {formatDateForDisplay(transaction.transaction_date)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {formatTimeForDisplay(transaction.transaction_date)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {cleanString(transaction.shift)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {cleanString(transaction.kd_kasir)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {cleanString(transaction.kd_kassa)}
                      </td>
                      <td className="h-[48px] px-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.grand_total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {searchTerm && searchInput.trim().length >= 3
                        ? "No transactions found for your search."
                        : searchTerm &&
                          searchInput.trim().length > 0 &&
                          searchInput.trim().length < 3
                          ? "Please enter at least 3 characters to search."
                          : "No transactions found for correction."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Keyboard instructions for accessibility */}
          <div id="keyboard-instructions" className="sr-only">
            Use arrow keys to navigate table rows, Enter to select/deselect, Shift+Enter to process return for selected transaction, and Ctrl+R to refresh.
          </div>

          {displayTransactions.length > 0 && (
            <div className="mb-6 flex justify-between items-center">
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
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${option === pageSize
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

          {selectedTransaction && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details -{" "}
                  {cleanString(selectedTransaction.invoice_number)}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTransactionClick(selectedTransaction)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                    disabled={!selectedTransaction}
                  >
                    Return
                  </button>
                   <div className="text-xs text-gray-500">
                     or press{" "}
                     <kbd className="px-2 py-1 bg-gray-200 rounded">Shift</kbd> +{" "}
                     <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd>{" "}
                     or{" "}
                     <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl</kbd> +{" "}
                     <kbd className="px-2 py-1 bg-gray-200 rounded">R</kbd> to refresh
                   </div>
                </div>
              </div>

              {isDetailLoading && (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                      Loading transaction details...
                    </span>
                  </div>
                </div>
              )}

              {detailError && (
                <div className="p-4 bg-red-50 border-t border-red-200">
                  <div className="text-red-700 text-sm">
                    Error loading transaction details: {detailError}
                  </div>
                </div>
              )}

              {transactionDetail &&
                transactionDetail.items &&
                transactionDetail.items.length > 0 && (
                  <>
                    <table
                      className="w-full"
                      role="table"
                      aria-label="Transaction correction data"
                      aria-describedby={focusedRowIndex >= 0 ? "keyboard-instructions" : undefined}
                    >
                      <thead className="sticky top-0 bg-[#F5F5F5]">
                        <tr className="border-b border-gray-200">
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[60px]">
                            No
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                            Product Code
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[200px]">
                            Product Name
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                            Qty
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                            Sub Total
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                            Discount
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                            SC
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                            Misc
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map(
                          (item: TransactionDetailItem, index: number) => (
                            <tr
                              key={`${item.product_code}-${index}`}
                              className="border-b border-gray-100"
                            >
                              <td className="h-[40px] px-4 text-sm text-gray-600">
                                {itemStartIndex + index + 1}
                              </td>
                              <td className="h-[40px] px-4 text-sm font-medium text-gray-900">
                                {cleanString(item.product_code)}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-900">
                                {cleanString(item.product_name)}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-600">
                                {item.quantity}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-900">
                                {formatCurrency(item.sub_total)}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-600">
                                {item.nominal_discount > 0
                                  ? formatCurrency(item.nominal_discount)
                                  : "-"}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-600">
                                {item.service_fee > 0
                                  ? formatCurrency(item.service_fee)
                                  : "-"}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-600">
                                {item.misc > 0
                                  ? formatCurrency(item.misc)
                                  : "-"}
                              </td>
                              <td className="h-[40px] px-4 text-sm font-semibold text-gray-900">
                                {formatCurrency(item.total)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    {transactionItems.length > productPageSize && (
                      <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show</span>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setIsProductPageSizeOpen(
                                    !isProductPageSizeOpen
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                              >
                                {productPageSize}
                                <ChevronDown size={14} />
                              </button>
                              {isProductPageSizeOpen && (
                                <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                                  {pageSizeOptions.map((option) => (
                                    <button
                                      key={option}
                                      onClick={() =>
                                        handleProductPageSizeChange(option)
                                      }
                                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${option === productPageSize
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
                              from {transactionItems.length}
                            </span>
                          </div>
                        </div>
                        {itemTotalPages > 1 && (
                          <Pagination
                            currentPage={productCurrentPage}
                            totalPages={itemTotalPages}
                            onPageChange={handleProductPageChange}
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}

              {transactionDetail &&
                (!transactionDetail.items ||
                  transactionDetail.items.length === 0) && (
                  <div className="p-8 text-center text-gray-500">
                    No items found for this transaction.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      <ReturnTypeDialog
        isOpen={showReturnTypeDialog}
        onClose={handleReturnTypeClose}
        onConfirm={handleReturnTypeConfirm}
        transactionData={selectedTransaction ? {
          invoice_number: selectedTransaction.invoice_number,
          customer_name: selectedTransaction.customer_name || "Walk-in Customer",
          date: formatDateForDisplay(selectedTransaction.transaction_date),
          time: formatTimeForDisplay(selectedTransaction.transaction_date),
        } : undefined}
      />

      <ReturnNoteDialog
        isOpen={showReturnNoteDialog}
        onClose={handleReturnNoteClose}
        onConfirm={handleReturnNoteConfirm}
        returnType={selectedReturnType}
        transactionData={selectedTransaction ? {
          invoice_number: selectedTransaction.invoice_number,
          customer_name: selectedTransaction.customer_name || "Walk-in Customer",
          date: formatDateForDisplay(selectedTransaction.transaction_date),
          time: formatTimeForDisplay(selectedTransaction.transaction_date),
        } : undefined}
      />
    </div>
  );
};

export default TransactionCorrectionDialog;