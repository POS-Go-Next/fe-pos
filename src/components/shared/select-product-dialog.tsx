// components/shared/select-product-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, X } from "lucide-react";
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
    limit: 7,
    search: "",
  });

  // Use the stock hook to get data from API
  const { stockList, isLoading, error, totalPages, totalDocs, refetch } =
    useStock(apiParams);

  // Reset to page 1 when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setApiParams({ offset: 0, limit: 7, search: "" });
      setSearchInput("");
      setSearchTerm("");
      setIsSearchActive(false);
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = () => {
    const trimmedSearch = searchInput.trim();
    setSearchTerm(trimmedSearch);
    setIsSearchActive(trimmedSearch !== "");
    setCurrentPage(1);
    setApiParams({
      offset: 0,
      limit: 7,
      search: trimmedSearch,
    });
  };

  // Handle search toggle (reset)
  const handleSearchToggle = () => {
    setSearchInput("");
    setSearchTerm("");
    setIsSearchActive(false);
    setCurrentPage(1);
    setApiParams({ offset: 0, limit: 7, search: "" });
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
    const offset = (page - 1) * 7;
    setApiParams({
      offset,
      limit: 7,
      search: searchTerm,
    });
  };

  // Handle enter key for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header - Outside white background */}
        <div className="flex items-center py-3">
          <button
            onClick={onClose}
            className="mr-4 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold flex-grow text-gray-900">
            Select Product
          </h2>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* White background container */}
        <div className="bg-white rounded-lg overflow-hidden flex-grow flex flex-col p-4">
          {/* Search bar */}
          <div className="py-4">
            <div className="relative flex">
              <Input
                type="text"
                placeholder="Search product name, SKU, or barcode..."
                className="pl-10 bg-[#F5F5F5] border-none flex-grow mr-2 h-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {isSearchActive ? (
                <Button
                  variant="destructive"
                  onClick={handleSearchToggle}
                  className="flex items-center h-10"
                >
                  <X size={16} className="mr-2" /> Reset
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSearch}
                  className="flex items-center h-10"
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 bg-[#F5F5F5] py-2 px-4 rounded-lg font-medium text-gray-600">
            <div className="col-span-1">#</div>
            <div className="col-span-1">SKU</div>
            <div className="col-span-2">Product Name</div>
            <div className="col-span-1">Dept</div>
            <div className="col-span-1">Satuan</div>
            <div className="col-span-1">HJ Ecer</div>
            <div className="col-span-1">HJ Swalayan</div>
            <div className="col-span-1">HJ Perpack</div>
            <div className="col-span-1">Isi</div>
            <div className="col-span-1">Strip</div>
            <div className="col-span-1">Stock</div>
          </div>

          {/* Table rows */}
          <div className="flex-grow overflow-y-auto">
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
                  className={`grid grid-cols-12 p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                    index % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="col-span-1 flex items-center">
                    <div className="w-5 h-5 rounded-full mr-2 bg-transparent"></div>
                    {index + 1 + (currentPage - 1) * 7}
                  </div>
                  <div className="col-span-1 text-sm">{product.kode_brg}</div>
                  <div className="col-span-2 text-sm font-medium">
                    {product.nama_brg}
                  </div>
                  <div className="col-span-1 text-sm">{product.id_dept}</div>
                  <div className="col-span-1 text-sm">{product.satuan}</div>
                  <div className="col-span-1 text-sm">
                    Rp {product.hj_ecer?.toLocaleString("id-ID") || 0}
                  </div>
                  <div className="col-span-1 text-sm">
                    Rp {product.hj_ecer?.toLocaleString("id-ID") || 0}
                  </div>
                  <div className="col-span-1 text-sm">
                    Rp {product.hj_ecer?.toLocaleString("id-ID") || 0}
                  </div>
                  <div className="col-span-1 text-sm">{product.isi}</div>
                  <div className="col-span-1 text-sm">{product.strip}</div>
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

          {/* Pagination */}
          {stockList.length > 0 && totalPages && totalPages > 1 && (
            <div className="p-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 7 + 1} to{" "}
                {Math.min(currentPage * 7, totalDocs || 0)} of {totalDocs || 0}{" "}
                products
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
