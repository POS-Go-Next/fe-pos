// components/shared/branch-wide-stock-dialog.tsx - IMPROVED WITH PROPER PAGINATION
"use client";

import React, { useState } from "react";
import { X, Search, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranchWideStock } from "@/hooks/useBranchWideStock";
import type { BranchStockTableData } from "@/types/branch-stock";

interface BranchWideStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productCode?: string;
  retailPrice?: string;
  wholesalePrice?: string;
  quantity?: number;
  expiredDate?: string;
  units?: number;
  strips?: number;
  qtyFree?: number;
}

const BranchWideStockDialog: React.FC<BranchWideStockDialogProps> = ({
  isOpen,
  onClose,
  productName = "",
  productCode,
  retailPrice,
  wholesalePrice,
  quantity = 0,
  expiredDate,
  units = 1,
  strips = 1,
  qtyFree = 1,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  // Hook untuk mendapatkan data branch wide stock
  const { branchStockData, branchTableData, isLoading, error, refetch } =
    useBranchWideStock({
      kode_brg: productCode || null,
      enabled: isOpen && !!productCode,
    });

  const pageSizeOptions = [5, 10, 25, 50];

  // Filter data berdasarkan search term
  const filteredData: BranchStockTableData[] = branchTableData.filter(
    (branch) =>
      branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.idBranch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke page 1 ketika search
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset ke page 1 ketika page size berubah
    setIsPageSizeOpen(false);
  };

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setCurrentPage(1);
      setPageSize(5);
    }
  }, [isOpen]);

  // Reset pagination when filtered data changes
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, currentPage, totalPages]);

  if (!isOpen) return null;

  // Gunakan data dari API jika ada, fallback ke props
  const displayData = {
    productName: branchStockData?.nama_brg || productName,
    retailPrice: branchStockData
      ? `Rp ${branchStockData.hj_ecer?.toLocaleString("id-ID")}`
      : retailPrice,
    wholesalePrice: branchStockData
      ? `Rp ${branchStockData.hj_ecer?.toLocaleString("id-ID")}`
      : wholesalePrice,
    quantity: branchStockData?.q_bbs || quantity,
    expiredDate: branchStockData
      ? new Date(branchStockData.tgl_berlaku_nie).toLocaleDateString("en-GB")
      : expiredDate,
    units: branchStockData?.isi || units,
    strips: strips,
    qtyFree: qtyFree,
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Branch wide stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Product Details Section */}
          <div className="rounded-lg border border-gray-200 mb-6">
            <div className="bg-blue-100 rounded-t-lg px-6 py-3">
              <h3 className="text-blue-600 font-medium text-center">
                Product Details
              </h3>
            </div>

            <div className="bg-white rounded-b-lg p-6">
              <div className="grid grid-cols-8 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Product Name</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.productName}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Retail Price</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.retailPrice}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Quantity</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.quantity}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Strips</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.strips}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Expired Date</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.expiredDate}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Wholesale Price</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.wholesalePrice}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Units (isi)</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.units}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Qty Free</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">
                    {displayData.qtyFree}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search Branch Name"
              className="pl-10 bg-white border-gray-200 h-12"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          {/* Table Container */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-6 bg-gray-50 p-4 text-sm font-medium text-gray-700 border-b border-gray-200">
              <div className="flex items-center gap-1">
                ID Branch
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Branch Name
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Stock
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Date Added
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Phone Number/Fax
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Description
                <svg
                  className="w-3 h-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-[300px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">
                      Loading branch stock data...
                    </span>
                  </div>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 mb-4">
                    <p className="font-medium">
                      Error loading branch stock data
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((branch, index) => (
                  <div
                    key={branch.idBranch}
                    className="grid grid-cols-6 p-4 text-sm text-gray-900 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="truncate">{branch.idBranch}</div>
                    <div className="truncate">{branch.branchName}</div>
                    <div className="truncate font-semibold text-green-600">
                      {branch.stock}
                    </div>
                    <div className="truncate">{branch.dateAdded}</div>
                    <div className="truncate">{branch.phoneNumber}</div>
                    <div className="truncate">{branch.description}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm
                    ? `No branches found for "${searchTerm}"`
                    : "No branch data available"}
                </div>
              )}
            </div>
          </div>

          {/* Footer with pagination and page size selector */}
          {!isLoading && !error && filteredData.length > 0 && (
            <div className="mt-6 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <div className="relative">
                    <button
                      onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm min-w-[60px] justify-between"
                    >
                      {pageSize}
                      <ChevronDown size={14} />
                    </button>
                    {isPageSizeOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsPageSizeOpen(false)}
                        />
                        <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[60px]">
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
                      </>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    from {totalItems}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {endIndex} of {totalItems}{" "}
                  branches
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-200"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Button>

                  {/* Page numbers - Smart pagination */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;

                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              currentPage === i
                                ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </Button>
                        );
                      }
                    } else {
                      // Smart pagination for many pages
                      pages.push(
                        <Button
                          key={1}
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            currentPage === 1
                              ? "bg-blue-500 text-white border-blue-500"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </Button>
                      );

                      if (currentPage > 3) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              currentPage === i
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </Button>
                        );
                      }

                      if (currentPage < totalPages - 2) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      if (totalPages > 1) {
                        pages.push(
                          <Button
                            key={totalPages}
                            variant={
                              currentPage === totalPages ? "default" : "outline"
                            }
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              currentPage === totalPages
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                    }

                    return pages;
                  })()}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-200"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchWideStockDialog;
