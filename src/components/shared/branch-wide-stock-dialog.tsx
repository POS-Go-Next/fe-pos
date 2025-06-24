// components/shared/branch-wide-stock-dialog.tsx
"use client";

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BranchStockData {
  idBranch: string;
  branchName: string;
  stock: number;
  dateAdded: string;
  phoneNumber: string;
  description: string;
}

interface BranchWideStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
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
  productName = "Jamu Tolak Angin + Madu",
  retailPrice = "Rp 10.000",
  wholesalePrice = "Rp 10.000",
  quantity = 87,
  expiredDate = "29/05/2030",
  units = 1,
  strips = 12,
  qtyFree = 1
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample branch data
  const branchData: BranchStockData[] = [
    {
      idBranch: "001",
      branchName: "AP Roxy Biak",
      stock: 39,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6254900470552",
      description: "ONLINE"
    },
    {
      idBranch: "002",
      branchName: "AP Roxy Jatibaru",
      stock: 4,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6291941614648",
      description: "ONLINE"
    },
    {
      idBranch: "003",
      branchName: "AP Roxy Pademangan",
      stock: 88,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6239047583156",
      description: "ONLINE"
    },
    {
      idBranch: "004",
      branchName: "AP Roxy Mangga Besar",
      stock: 19,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6202905281495",
      description: "ONLINE"
    },
    {
      idBranch: "005",
      branchName: "AP Roxy Galaxy",
      stock: 42,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6264239583113",
      description: "ONLINE"
    },
    {
      idBranch: "006",
      branchName: "AP Roxy Kelapa Gading",
      stock: 25,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6281234567890",
      description: "ONLINE"
    },
    {
      idBranch: "007",
      branchName: "AP Roxy Sunter",
      stock: 67,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6289876543210",
      description: "ONLINE"
    },
    {
      idBranch: "008",
      branchName: "AP Roxy Tanjung Priok",
      stock: 15,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6287654321098",
      description: "ONLINE"
    },
    {
      idBranch: "009",
      branchName: "AP Roxy Ancol",
      stock: 33,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6285432109876",
      description: "ONLINE"
    },
    {
      idBranch: "010",
      branchName: "AP Roxy Kemayoran",
      stock: 58,
      dateAdded: "05/12/2024 15:06:24",
      phoneNumber: "+6283210987654",
      description: "ONLINE"
    }
  ];

  // Filter data berdasarkan search term
  const filteredData = branchData.filter(branch =>
    branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.idBranch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke page 1 ketika search
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Branch wide stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Product Details Section - Background biru hanya untuk header sesuai figma */}
          <div className="rounded-lg border border-gray-200 mb-6">
            {/* Header dengan background biru */}
            <div className="bg-blue-100 rounded-t-lg px-6 py-3">
              <h3 className="text-blue-600 font-medium text-center">Product Details</h3>
            </div>
            
            {/* Content dengan background putih - Layout 1 baris horizontal sesuai figma */}
            <div className="bg-white rounded-b-lg p-6">
              <div className="grid grid-cols-8 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Product Name</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{productName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Retail Price</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{retailPrice}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Quantity</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{quantity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Strips</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{strips}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Expired Date</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{expiredDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Wholesale Price</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{wholesalePrice}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Units (isi)</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{units}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 mb-1">Qty Free</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-medium text-gray-900">{qtyFree}</span>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-6 bg-gray-50 p-4 text-sm font-medium text-gray-700 border-b border-gray-200">
              <div className="flex items-center gap-1">
                ID Branch
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Branch Name
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Stock
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Date Added
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Phone Number/Fax
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                Description
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>

            {/* Body */}
            <div>
              {paginatedData.length > 0 ? (
                paginatedData.map((branch, index) => (
                  <div
                    key={branch.idBranch}
                    className="grid grid-cols-6 p-4 text-sm text-gray-900 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="truncate">{branch.idBranch}</div>
                    <div className="truncate">{branch.branchName}</div>
                    <div className="truncate">{branch.stock}</div>
                    <div className="truncate">{branch.dateAdded}</div>
                    <div className="truncate">{branch.phoneNumber}</div>
                    <div className="truncate">{branch.description}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No branches found for "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Show</span>
              <select className="border border-gray-200 rounded px-3 py-1 bg-white text-sm" disabled>
                <option>5</option>
              </select>
              <span>from {filteredData.length}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-200"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              {/* Page numbers */}
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      currentPage === pageNum 
                        ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="text-gray-400 px-1">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-200 hover:bg-gray-50"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-200"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchWideStockDialog;