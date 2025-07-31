// app/create-order/choose-menu/_components/TransactionHistoryDialog.tsx - HARD FIX VERSION
"use client";

import React, { useState, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/shared/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useTransaction } from "@/hooks/useTransaction";
import { useTransactionDetail } from "@/hooks/useTransactionDetail";
import type { TransactionData, TransactionItem } from "@/types/transaction";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface TransactionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionHistoryDialog: React.FC<TransactionHistoryDialogProps> = ({
  isOpen,
  onClose,
}) => {
  // 🔥 HARD FIX: Force close on initial render to prevent auto-open
  const [forceOpen, setForceOpen] = useState(false);
  const [keyboardTriggered, setKeyboardTriggered] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >();

  // Product table pagination states
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(5);
  const [isProductPageSizeOpen, setIsProductPageSizeOpen] = useState(false);

  const pageSizeOptions = [5, 10, 25, 50];

  // 🔥 CRITICAL FIX: Add keyboard listener to only allow Ctrl+F7 to open dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "F7") {
        console.log("🔥 Ctrl+F7 detected - allowing dialog to open");
        event.preventDefault();
        setKeyboardTriggered(true);
        setForceOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🔥 HARD FIX: Override isOpen prop - only show if keyboard triggered
  const shouldShowDialog = isOpen && (forceOpen || keyboardTriggered);

  // Calculate offset for API
  const offset = (currentPage - 1) * pageSize;

  // Format dates for API
  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const {
    transactionList,
    isLoading,
    error,
    refetch,
    totalPages = 0,
    totalDocs = 0,
  } = useTransaction({
    limit: pageSize,
    offset,
    from_date: appliedDateRange?.from
      ? formatDateForAPI(appliedDateRange.from)
      : "",
    to_date: appliedDateRange?.to ? formatDateForAPI(appliedDateRange.to) : "",
  });

  // Use transaction detail hook for selected transaction
  const {
    transactionDetail,
    isLoading: isDetailLoading,
    error: detailError,
  } = useTransactionDetail({
    invoice_number: selectedTransaction?.invoice_number || null,
    enabled: !!selectedTransaction,
  });

  // Paginate transaction items
  const transactionItems = transactionDetail?.items || [];
  const itemTotalPages = Math.ceil(transactionItems.length / productPageSize);
  const itemStartIndex = (productCurrentPage - 1) * productPageSize;
  const paginatedItems = transactionItems.slice(
    itemStartIndex,
    itemStartIndex + productPageSize
  );

  useEffect(() => {
    if (shouldShowDialog) {
      setCurrentPage(1);
      setPageSize(5);
      setSearchInput("");
      setSearchTerm("");
      setSelectedTransaction(null);
      setIsPageSizeOpen(false);
      setAppliedDateRange(undefined);
      // Reset product pagination
      setProductCurrentPage(1);
      setProductPageSize(5);
      setIsProductPageSizeOpen(false);
    }
  }, [shouldShowDialog]);

  // Search effect with 3 character minimum
  useEffect(() => {
    const trimmedSearch = searchInput.trim();

    if (trimmedSearch.length >= 3) {
      const timeoutId = setTimeout(() => {
        setSearchTerm(trimmedSearch);
        setCurrentPage(1);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (trimmedSearch.length === 0) {
      // FIXED: Immediately clear search when input is empty
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [searchInput]);

  // Filter transactions based on search term (client-side filtering)
  const filteredTransactions = React.useMemo(() => {
    if (!searchTerm) return transactionList;

    return transactionList.filter((transaction) => {
      const customerName = transaction.customer_name?.toLowerCase() || "";
      const invoiceNumber = transaction.invoice_number?.toLowerCase() || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        customerName.includes(searchLower) ||
        invoiceNumber.includes(searchLower)
      );
    });
  }, [transactionList, searchTerm]);

  // Calculate filtered pagination values
  const filteredTotalDocs = filteredTransactions.length;
  const filteredTotalPages = Math.ceil(filteredTotalDocs / pageSize);
  const paginatedFilteredTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Use filtered values when search is active
  const displayTransactions = searchTerm
    ? paginatedFilteredTransactions
    : filteredTransactions;
  const displayTotalPages = searchTerm ? filteredTotalPages : totalPages;
  const displayTotalDocs = searchTerm ? filteredTotalDocs : totalDocs;

  // Helper function to format date for display
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

  // Helper function to format time for display
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

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // Helper function to clean string (remove extra spaces)
  const cleanString = (str: string): string => {
    return str.trim();
  };

  // FIXED: Reset currentPage when switching between search and normal mode
  useEffect(() => {
    // When searchTerm changes (from empty to search or vice versa), reset to page 1
    if (currentPage > 1) {
      const maxPages = searchTerm
        ? Math.ceil(filteredTransactions.length / pageSize)
        : totalPages;
      if (currentPage > maxPages) {
        setCurrentPage(1);
      }
    }
  }, [
    searchTerm,
    filteredTransactions.length,
    pageSize,
    totalPages,
    currentPage,
  ]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAppliedDateRange(range);
    setCurrentPage(1);
    console.log("✅ Date range applied:", range);
  };

  const handleRowClick = (transaction: TransactionData) => {
    setSelectedTransaction(
      selectedTransaction?.invoice_number === transaction.invoice_number
        ? null
        : transaction
    );
    // Reset product pagination when selecting new transaction
    setProductCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const maxPages = searchTerm ? filteredTotalPages : totalPages;
    if (page < 1 || page > maxPages) return;

    // FIXED: Additional validation to prevent 503 errors
    if (!searchTerm) {
      // For server-side pagination, validate against actual totalPages
      if (page > totalPages || (page - 1) * pageSize >= (totalDocs || 0)) {
        console.warn("Page out of bounds:", { page, totalPages, totalDocs });
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

  const handleProductPageChange = (page: number) => {
    if (page < 1 || page > itemTotalPages) return;
    setProductCurrentPage(page);
  };

  const handleProductPageSizeChange = (newPageSize: number) => {
    setProductPageSize(newPageSize);
    setProductCurrentPage(1);
    setIsProductPageSizeOpen(false);
  };

  // 🔥 HARD FIX: Handle close with reset
  const handleClose = () => {
    console.log("🔍 Closing Transaction History Dialog - resetting states");
    setForceOpen(false);
    setKeyboardTriggered(false);
    onClose();
  };

  // 🔥 CRITICAL: Don't render anything if not properly triggered
  if (!shouldShowDialog) {
    console.log("🔍 Dialog blocked - not triggered by Ctrl+F7");
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search and Controls */}
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

            {/* Date Range Picker */}
            <DateRangePicker
              value={appliedDateRange}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-700 text-sm">
                Error loading transactions: {error}
              </div>
            </div>
          )}

          {/* Transactions Table */}
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
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                    Customer
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                    Doctor
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Cashier
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                    Items
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                    Grand Total
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
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
                ) : displayTransactions.length > 0 ? (
                  displayTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.invoice_number}
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedTransaction?.invoice_number ===
                        transaction.invoice_number
                          ? "bg-blue-50 border-2 border-blue-400"
                          : "border-2 border-transparent"
                      }`}
                      onClick={() => handleRowClick(transaction)}
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
                      <td className="h-[48px] px-4 text-sm text-gray-900">
                        {cleanString(transaction.customer_name) || "-"}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {cleanString(transaction.doctor_name) || "-"}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {cleanString(transaction.cashier)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.total_items}
                      </td>
                      <td className="h-[48px] px-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.grand_total)}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {transaction.payment_type}
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
                        : "No transactions found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for transactions - FIXED TO MATCH SELECT-PRODUCT-DIALOG */}
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

          {/* Transaction Details */}
          {selectedTransaction && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              {/* Transaction Summary Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details -{" "}
                  {cleanString(selectedTransaction.invoice_number)}
                </h3>
              </div>

              {/* Loading State for Details */}
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

              {/* Error State for Details */}
              {detailError && (
                <div className="p-4 bg-red-50 border-t border-red-200">
                  <div className="text-red-700 text-sm">
                    Error loading transaction details: {detailError}
                  </div>
                </div>
              )}

              {/* Items Table */}
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
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 min-w-[250px]">
                            Product Name
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[80px]">
                            Qty
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                            Unit Price
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                            Discount
                          </th>
                          <th className="text-left h-[40px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                            Sub Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map(
                          (item: TransactionItem, index: number) => (
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
                                {formatCurrency(item.price)}
                              </td>
                              <td className="h-[40px] px-4 text-sm text-gray-600">
                                {item.discount > 0
                                  ? formatCurrency(item.discount)
                                  : "-"}
                              </td>
                              <td className="h-[40px] px-4 text-sm font-semibold text-gray-900">
                                {formatCurrency(item.sub_total)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    {/* Item Pagination - FIXED TO MATCH SELECT-PRODUCT-DIALOG */}
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

              {/* No Items Found */}
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
    </div>
  );
};

export default TransactionHistoryDialog;