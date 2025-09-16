"use client";

import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCorporate } from "@/hooks/useCorporate";
import type { CorporateData } from "@/types/corporate";
import { ChevronDown, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CorporateDiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (selectedCorporate: CorporateData) => void;
}

const CorporateDiscountDialog: React.FC<CorporateDiscountDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [selectedCorporate, setSelectedCorporate] = useState<string | null>(
        null
    );

    const pageSizeOptions = [5, 10, 25, 50];

    const offset = (currentPage - 1) * pageSize;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    const {
        corporateList,
        isLoading,
        error,
        refetch,
        totalPages = 0,
        totalDocs = 0,
    } = useCorporate({
        limit: pageSize,
        offset,
        search: debouncedSearch,
        type: "corporate",
    });

    useEffect(() => {
        if (isOpen) {
            console.log("🔍 Corporate Discount Dialog opened");
            setCurrentPage(1);
            setPageSize(10);
            setSearchInput("");
            setDebouncedSearch("");
            setSelectedCorporate(null);
            setIsPageSizeOpen(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleRowSelect = (kd_corp: string) => {
        setSelectedCorporate(selectedCorporate === kd_corp ? null : kd_corp);
    };

    const handleSubmit = () => {
        if (selectedCorporate) {
            const selectedData = corporateList.find(
                (corp) => corp.kd_corp === selectedCorporate
            );
            if (selectedData) {
                onSubmit(selectedData);
            }
        }
    };

    const handleCancel = () => {
        setSelectedCorporate(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
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

    const formatCorporateName = (name: string): string => {
        return name.trim();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
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

                <div className="flex-1 overflow-auto p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="text-red-700 text-sm">
                                Error loading corporates: {error}
                                <button
                                    onClick={refetch}
                                    className="ml-2 text-red-600 hover:text-red-800 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

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
                                        <td
                                            colSpan={6}
                                            className="text-center py-20"
                                        >
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                <span className="ml-2 text-gray-600">
                                                    Loading corporates...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : corporateList.length > 0 ? (
                                    corporateList.map((corporate, index) => (
                                        <tr
                                            key={corporate.kd_corp}
                                            className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                                selectedCorporate ===
                                                corporate.kd_corp
                                                    ? "bg-blue-50 border-2 border-blue-400"
                                                    : "border-2 border-transparent"
                                            }`}
                                            onClick={() =>
                                                handleRowSelect(
                                                    corporate.kd_corp
                                                )
                                            }
                                        >
                                            <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                                                {corporate.kd_corp}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-900">
                                                {formatCorporateName(
                                                    corporate.nm_corp
                                                )}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600">
                                                {corporate.rules}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600">
                                                {corporate.rules2}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600">
                                                {corporate.piutang
                                                    ? "TRUE"
                                                    : "FALSE"}
                                            </td>
                                            <td className="h-[48px] px-4 text-sm text-gray-600">
                                                {corporate.margin
                                                    ? "TRUE"
                                                    : "FALSE"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-gray-500"
                                        >
                                            {debouncedSearch
                                                ? "No corporates found for your search."
                                                : "No corporates found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {corporateList.length > 0 && (
                        <div className="mt-5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Show
                                    </span>
                                    <div className="relative">
                                        <button
                                            onClick={() =>
                                                setIsPageSizeOpen(
                                                    !isPageSizeOpen
                                                )
                                            }
                                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 text-sm"
                                        >
                                            {pageSize}
                                            <ChevronDown size={14} />
                                        </button>
                                        {isPageSizeOpen && (
                                            <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                                                {pageSizeOptions.map(
                                                    (option) => (
                                                        <button
                                                            key={option}
                                                            onClick={() =>
                                                                handlePageSizeChange(
                                                                    option
                                                                )
                                                            }
                                                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                                option ===
                                                                pageSize
                                                                    ? "bg-blue-50 text-blue-600"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        from {totalDocs}
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
                        disabled={!selectedCorporate}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CorporateDiscountDialog;
