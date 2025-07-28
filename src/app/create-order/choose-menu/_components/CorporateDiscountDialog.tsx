// app/create-order/choose-menu/_components/CorporateDiscountDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/shared/pagination";

interface CorporateData {
  idCorp: string;
  corporateName: string;
  rules: number;
  rules1: number;
  piutang: boolean;
  margin: boolean;
}

interface CorporateDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedCorporates: CorporateData[]) => void;
}

const CorporateDiscountDialog: React.FC<CorporateDiscountDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [selectedCorporates, setSelectedCorporates] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  const mockCorporates: CorporateData[] = [
    {
      idCorp: "001",
      corporateName: "AP Roxy Biak",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "002",
      corporateName: "AP Roxy Jatibaru",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "003",
      corporateName: "AP Roxy Pademangan",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "004",
      corporateName: "AP Roxy Mangga Besar",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "005",
      corporateName: "AP Roxy Galaxy",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "006",
      corporateName: "AP Roxy Poltangan",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "007",
      corporateName: "AP Roxy gandaria",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "008",
      corporateName: "AP Roxy Pondok Cabe",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "009",
      corporateName: "AP Roxy Keamanan",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "010",
      corporateName: "AP Roxy Jakasampurna",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    // Add more mock data for pagination testing
    {
      idCorp: "011",
      corporateName: "AP Roxy Kelapa Gading",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "012",
      corporateName: "AP Roxy PIK",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "013",
      corporateName: "AP Roxy Senayan",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "014",
      corporateName: "AP Roxy Kuningan",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
    {
      idCorp: "015",
      corporateName: "AP Roxy Menteng",
      rules: -50,
      rules1: 0,
      piutang: true,
      margin: false,
    },
  ];

  const pageSizeOptions = [5, 10, 25, 50, 100];

  // Filter and paginate data
  const filteredCorporates = mockCorporates.filter(
    (corp) =>
      corp.corporateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corp.idCorp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCorporates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCorporates = filteredCorporates.slice(
    startIndex,
    startIndex + pageSize
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setPageSize(10);
      setSearchInput("");
      setSearchTerm("");
      setSelectedCorporates(new Set());
      setIsPageSizeOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  if (!isOpen) return null;

  const handleRowSelect = (idCorp: string) => {
    const newSelected = new Set(selectedCorporates);
    if (newSelected.has(idCorp)) {
      newSelected.delete(idCorp);
    } else {
      newSelected.add(idCorp);
    }
    setSelectedCorporates(newSelected);
  };

  const handleSubmit = () => {
    const selectedData = mockCorporates.filter((corp) =>
      selectedCorporates.has(corp.idCorp)
    );
    onSubmit(selectedData);
  };

  const handleCancel = () => {
    setSelectedCorporates(new Set());
    onClose();
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setIsPageSizeOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Corporate Discount
          </h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search Corporate Name"
              className="pl-10 bg-[#F5F5F5] border-none h-12"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F5F5F5] border-b border-gray-200">
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[120px]">
                    ID Corp
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 min-w-[250px]">
                    Corporate Name
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Rules
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Rules 1
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Piutang
                  </th>
                  <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 w-[100px]">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">
                          Loading corporates...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCorporates.length > 0 ? (
                  paginatedCorporates.map((corporate, index) => (
                    <tr
                      key={corporate.idCorp}
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedCorporates.has(corporate.idCorp)
                          ? "bg-blue-50"
                          : ""
                      }`}
                      onClick={() => handleRowSelect(corporate.idCorp)}
                    >
                      <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                        {corporate.idCorp}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-900">
                        {corporate.corporateName}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {corporate.rules}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {corporate.rules1}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {corporate.piutang ? "TRUE" : "FALSE"}
                      </td>
                      <td className="h-[48px] px-4 text-sm text-gray-600">
                        {corporate.margin ? "TRUE" : "FALSE"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {searchTerm
                        ? "No corporates found for your search."
                        : "No corporates found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with pagination and page size selector */}
          {paginatedCorporates.length > 0 && (
            <div className="mt-5 flex justify-between items-center">
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
                    from {filteredCorporates.length}
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

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-8 py-3 border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={selectedCorporates.size === 0}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CorporateDiscountDialog;
