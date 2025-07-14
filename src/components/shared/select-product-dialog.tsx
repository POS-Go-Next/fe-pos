// components/shared/select-product-dialog.tsx - UPDATED TO POPUP SIZE
"use client";

import { useState, useEffect } from "react";
import { Search, Plus, X, Clock } from "lucide-react";
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
  const [apiParams, setApiParams] = useState({
    offset: 0,
    limit: 10, // Changed from 7 to 10 to match design
    search: "",
  });

  // Use the stock hook to get data from API
  const { stockList, isLoading, error, totalPages, totalDocs, refetch } =
    useStock(apiParams);

  // Reset to page 1 when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setApiParams({ offset: 0, limit: 10, search: "" });
      setSearchInput("");
      setSearchTerm("");
      setIsSearchActive(false);
    }
  }, [isOpen]);

  // Auto search when user types 3+ characters
  useEffect(() => {
    const trimmedSearch = searchInput.trim();

    if (trimmedSearch.length >= 3 || trimmedSearch.length === 0) {
      const timeoutId = setTimeout(() => {
        setSearchTerm(trimmedSearch);
        setIsSearchActive(trimmedSearch !== "");
        setCurrentPage(1);
        setApiParams({
          offset: 0,
          limit: 10,
          search: trimmedSearch,
        });
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchInput]);

  // Handle search reset
  const handleSearchReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setIsSearchActive(false);
    setCurrentPage(1);
    setApiParams({ offset: 0, limit: 10, search: "" });
  };

  // Handle product selection
  const handleSelectProduct = (product: StockData) => {
    onSelectProduct(product);
    onClose();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > (totalPages || 1)) return;

    setCurrentPage(page);
    const offset = (page - 1) * 10;
    setApiParams({
      offset,
      limit: 10,
      search: searchTerm,
    });
  };

  // Handle enter key (no longer needed for search)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* UPDATED: Changed to popup size with max dimensions */}
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Product
          </h2>
          {/* Close Button only */}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search SKU or Product Name (min 3 characters)"
                className="pl-10 bg-gray-50 border-gray-200 h-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            {/* History Button - moved from header */}
            <Button
              variant="outline"
              className="h-10 px-4 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              <Clock size={16} className="mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Table header */}
          <div className="grid grid-cols-12 bg-gray-50 py-3 px-6 text-sm font-medium text-gray-600 border-b border-gray-200">
            <div className="col-span-1">SKU</div>
            <div className="col-span-3">Product Name</div>
            <div className="col-span-1">Dept</div>
            <div className="col-span-1">UOM</div>
            <div className="col-span-1">HJ Ecer</div>
            <div className="col-span-1">HJ Swalayan</div>
            <div className="col-span-1">HJ Perpack</div>
            <div className="col-span-1">Isi</div>
            <div className="col-span-1">Strip</div>
            <div className="col-span-1">Stock</div>
          </div>

          {/* Table body */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="text-red-500 text-center mb-4">
                  <p className="font-medium">Error loading products</p>
                  <p className="text-sm text-gray-600 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : stockList.length > 0 ? (
              stockList.map((product, index) => (
                <div
                  key={product.kode_brg}
                  className={`grid grid-cols-12 px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 ${
                    index % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="col-span-1 text-sm font-medium text-gray-900">
                    {product.kode_brg}
                  </div>
                  <div className="col-span-3 text-sm font-medium text-gray-900">
                    {product.nama_brg}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {product.id_dept}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {product.satuan}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900">
                    Rp {product.hj_ecer?.toLocaleString("id-ID") || 0}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900">
                    Rp {product.hj_ecer?.toLocaleString("id-ID") || 0}
                  </div>
                  <div className="col-span-1 text-sm text-gray-900">
                    Rp {product.hj_ecer?.toLocaleString("id-ID") || 0}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {product.isi}
                  </div>
                  <div className="col-span-1 text-sm text-gray-600">
                    {product.strip}
                  </div>
                  <div className="col-span-1 text-sm font-medium text-green-600">
                    {product.q_bbs || 0}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {isSearchActive
                  ? "No products found for your search."
                  : "No products found."}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Pagination - Always show when there's data */}
        {stockList.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalDocs || 0)} of {totalDocs || 0}{" "}
              products
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
  );
}
