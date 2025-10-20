"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import Pagination from "@/components/shared/pagination";
import ReturnTypeDialog from "@/components/shared/return-type-dialog";
import { useTransaction } from "@/hooks/useTransaction";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface TransactionCorrectionData {
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

interface TransactionDetailItem {
  product_code: string;
  quantity: number;
  prescription_code: string;
  sub_total: number;
  nominal_discount: number;
  discount: number;
  service_fee: number;
  misc: number;
  disc_promo: number;
  value_promo: number;
  no_promo: string;
  promo_type: string;
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

export interface TransactionCorrectionWithReturnType extends TransactionCorrectionData {
  returnType: "item-based" | "full-return";
  returnReason?: string;
}

interface TransactionCorrectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction?: (transaction: TransactionCorrectionWithReturnType) => void;
}

export default function TransactionCorrectionDialog({
  isOpen,
  onClose,
  onSelectTransaction,
}: TransactionCorrectionDialogProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [showReturnTypeDialog, setShowReturnTypeDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionCorrectionData | null>(null);
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(5);
  const [isProductPageSizeOpen, setIsProductPageSizeOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const pageSizeOptions = [5, 10, 25, 50];

  const offset = (currentPage - 1) * pageSize;

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0];
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
  });

  const correctionData: TransactionCorrectionData[] = transactionList.map(
    (transaction) => ({
      receipt_id: transaction.invoice_number,
      date: new Date(transaction.transaction_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      shift: Math.floor(Math.random() * 3) + 1,
      time: new Date(transaction.transaction_date).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
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
      setPageSize(5);
      setSearchInput("");
      setSearchTerm("");
      
      // Set default date range to today
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      setAppliedDateRange({
        from: todayStart,
        to: todayEnd
      });
      
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
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

  const filteredCorrectionData = React.useMemo(() => {
    if (!searchTerm) return correctionData;

    return correctionData.filter((record) => {
      const customerName = record.customer_name?.toLowerCase() || "";
      const receiptId = record.receipt_id?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        customerName.includes(searchLower) || receiptId.includes(searchLower)
      );
    });
  }, [correctionData, searchTerm]);

  const filteredTotalDocs = filteredCorrectionData.length;
  const filteredTotalPages = Math.ceil(filteredTotalDocs / pageSize);
  const paginatedFilteredData = filteredCorrectionData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const displayData = searchTerm ? paginatedFilteredData : correctionData;
  const displayTotalPages = searchTerm ? filteredTotalPages : totalPages;
  const displayTotalDocs = searchTerm ? filteredTotalDocs : totalDocs;

  // Transaction details pagination
  const transactionItems = transactionDetail?.items || [];
  const itemStartIndex = (productCurrentPage - 1) * productPageSize;
  const paginatedItems = transactionItems.slice(
    itemStartIndex,
    itemStartIndex + productPageSize
  );
  const itemTotalPages = Math.ceil(transactionItems.length / productPageSize);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAppliedDateRange(range);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const maxPages = searchTerm ? filteredTotalPages : totalPages;
    if (page < 1 || page > maxPages) return;

    if (!searchTerm) {
      if (page > totalPages || (page - 1) * pageSize >= (totalDocs || 0)) {
        console.warn("Page out of bounds:", {
          page,
          totalPages,
          totalDocs,
        });
        return;
      }
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

  // Reset focused row when transactions change
  useEffect(() => {
    setFocusedRowIndex(-1);
  }, [displayData]);

  // Fetch transaction details when selected
  useEffect(() => {
    if (selectedTransaction) {
      fetchTransactionDetail(selectedTransaction.receipt_id);
    } else {
      setTransactionDetail(null);
    }
  }, [selectedTransaction]);

  const handleClose = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
    setAppliedDateRange(undefined);
    onClose();
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

  const handleTransactionClick = useCallback((transaction: TransactionCorrectionData) => {
    setSelectedTransaction(transaction);
    setShowReturnTypeDialog(true);
  }, []);

  const handleReturnTypeConfirm = (returnType: "item-based" | "full-return", returnReason?: string) => {
    if (selectedTransaction && onSelectTransaction) {
      // Pass both the transaction data and the return type
      onSelectTransaction({
        ...selectedTransaction,
        returnType,
        returnReason,
      });
    }
    setShowReturnTypeDialog(false);
    setSelectedTransaction(null);
    onClose();
  };

  const handleReturnTypeClose = () => {
    setShowReturnTypeDialog(false);
    setSelectedTransaction(null);
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

  // Arrow key navigation for table
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTransactions = displayData;
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
              setSelectedTransaction(
                selectedTransaction?.receipt_id === transaction.receipt_id
                  ? null
                  : transaction
              );
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayData, focusedRowIndex, handleTransactionClick, selectedTransaction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Transaction Correction / Return
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search Customer Name or Receipt ID (min 3 characters)"
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
                Error loading transactions: {error}
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
              }}
            >
              <table className="w-full border-collapse min-w-[1200px]">
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
                            Loading transactions...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : displayData.length > 0 ? (
                    displayData.map((record, index) => (
                      <tr
                        key={record.receipt_id}
                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                          selectedTransaction?.receipt_id === record.receipt_id
                            ? "bg-blue-50 border-2 border-blue-400"
                            : focusedRowIndex === index
                            ? "bg-gray-100 border-2 border-gray-300"
                            : "border-2 border-transparent"
                        }`}
                         onClick={() => {
                           setSelectedTransaction(
                             selectedTransaction?.receipt_id === record.receipt_id
                               ? null
                               : record
                           );
                         }}
                         tabIndex={focusedRowIndex === index ? 0 : -1}
                         role="row"
                         aria-selected={selectedTransaction?.receipt_id === record.receipt_id}
                         aria-describedby={focusedRowIndex === index ? "keyboard-instructions" : undefined}
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

          {/* Transaction Details Section */}
          {selectedTransaction && (
            <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details - {cleanString(selectedTransaction.receipt_id)}
                </h3>
                <div className="text-xs text-gray-500">
                  Press <kbd className="px-2 py-1 bg-gray-200 rounded">Shift</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to
                  process return
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
                    <table className="w-full">
                      <thead className="sticky top-0 bg-[#F5F5F5]">
                        <tr className="border-b border-gray-200">
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[60px]">
                            No
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                            Product Code
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
                                {item.misc > 0 ? formatCurrency(item.misc) : "-"}
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
                                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                        option === productPageSize
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

        {/* Keyboard instructions */}
        <div 
          id="keyboard-instructions" 
          className="px-6 pb-4 text-xs text-gray-500 border-t border-gray-100"
          aria-describedby={focusedRowIndex >= 0 ? "keyboard-instructions" : undefined}
        >
          <div className="flex items-center justify-center gap-4">
            <span>Use ↑↓ arrow keys to navigate</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to show details</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to process return</span>
          </div>
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

      <ReturnTypeDialog
        isOpen={showReturnTypeDialog}
        onClose={handleReturnTypeClose}
        onConfirm={handleReturnTypeConfirm}
        transactionData={selectedTransaction ? {
          receipt_id: selectedTransaction.receipt_id,
          customer_name: selectedTransaction.customer_name,
          date: selectedTransaction.date,
          time: selectedTransaction.time,
        } : undefined}
      />
    </div>
  );
}
