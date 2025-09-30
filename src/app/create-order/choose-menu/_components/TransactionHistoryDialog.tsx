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
  productName?: string;
  productCode?: string;
}

const TransactionHistoryDialog: React.FC<TransactionHistoryDialogProps> = ({
  isOpen,
  onClose,
  productName = "",
  productCode = "",
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);

  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >(undefined);

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
    refetch,
    totalPages = 0,
    totalDocs = 0,
  } = useTransaction({
    limit: pageSize,
    offset,
    date_gte: appliedDateRange?.from
      ? formatDateForAPI(appliedDateRange.from)
      : "",
    date_lte: appliedDateRange?.to ? formatDateForAPI(appliedDateRange.to) : "",
    bought_product_code: productCode,
  });

  const {
    transactionDetail,
    isLoading: isDetailLoading,
    error: detailError,
  } = useTransactionDetail({
    invoice_number: selectedTransaction?.invoice_number || null,
    enabled: !!selectedTransaction,
  });

  const transactionItems = transactionDetail?.items || [];
  const itemTotalPages = Math.ceil(transactionItems.length / productPageSize);
  const itemStartIndex = (productCurrentPage - 1) * productPageSize;
  const paginatedItems = transactionItems.slice(
    itemStartIndex,
    itemStartIndex + productPageSize
  );

  useEffect(() => {
    if (isOpen) {
      console.log(
        "📋 Transaction History Dialog opened for:",
        productName,
        "Code:",
        productCode
      );
      setCurrentPage(1);
      setPageSize(5);
      setSearchInput("");
      setSearchTerm("");
      setSelectedTransaction(null);
      setAppliedDateRange(undefined);
      setProductCurrentPage(1);
      setProductPageSize(5);
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

  const displayTransactions = searchTerm
    ? filteredTransactions
    : transactionList;
  const displayTotalPages = searchTerm
    ? Math.ceil(filteredTransactions.length / pageSize)
    : totalPages;
  const displayTotalDocs = searchTerm ? filteredTransactions.length : totalDocs;

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
    console.log("✅ Date range applied:", range);
  };

  const handleRowClick = (transaction: TransactionData) => {
    setSelectedTransaction(
      selectedTransaction?.invoice_number === transaction.invoice_number
        ? null
        : transaction
    );
    setProductCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (searchTerm) {
      const maxPages = Math.ceil(filteredTransactions.length / pageSize);
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
            Transaction History{productName && ` - ${productName}`}
            {productCode && (
              <span className="ml-2 text-sm text-gray-500">
                ({productCode})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
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
                        : productCode
                        ? `No transaction history found for product ${productCode}.`
                        : "No transactions found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

          {selectedTransaction && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details -{" "}
                  {cleanString(selectedTransaction.invoice_number)}
                </h3>
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
      </div>
    </div>
  );
};

export default TransactionHistoryDialog;
