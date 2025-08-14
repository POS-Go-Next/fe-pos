// app/create-order/choose-menu/_components/GlobalDiscountDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GlobalDiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        discountType: "Global" | "Employee";
        discountPercentage: number;
        selectedEmployee?: EmployeeData;
    }) => void;
}

interface EmployeeData {
    id: string;
    corporate_name: string;
    rules: string;
    rules1: string;
    piutang: boolean;
    margin: boolean;
}

const GlobalDiscountDialog: React.FC<GlobalDiscountDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [activeTab, setActiveTab] = useState<"Global" | "Employee">("Global");
    const [discountPercentage, setDiscountPercentage] = useState(0);

    // Employee tab specific states
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
        null
    );

    const pageSizeOptions = [5, 10, 25, 50];

    // Mock employee data - replace with actual API call
    const mockEmployees: EmployeeData[] = [
        {
            id: "001",
            corporate_name: "Mathew Hicks",
            rules: "-50",
            rules1: "0",
            piutang: true,
            margin: false,
        },
        {
            id: "002",
            corporate_name: "Dixie Brewer",
            rules: "-50",
            rules1: "0",
            piutang: true,
            margin: false,
        },
        {
            id: "003",
            corporate_name: "Cecilia Schultz",
            rules: "-50",
            rules1: "0",
            piutang: true,
            margin: false,
        },
        {
            id: "004",
            corporate_name: "Jimmie Stevens",
            rules: "-50",
            rules1: "0",
            piutang: true,
            margin: false,
        },
        {
            id: "005",
            corporate_name: "Thelma Robertson",
            rules: "-50",
            rules1: "0",
            piutang: true,
            margin: false,
        },
    ];

    const [employeeList] = useState<EmployeeData[]>(mockEmployees);
    const [isLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab("Global");
            setDiscountPercentage(0);
            setCurrentPage(1);
            setPageSize(5);
            setSearchInput("");
            setDebouncedSearch("");
            setSelectedEmployee(null);
            setIsPageSizeOpen(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredEmployees = employeeList.filter((employee) => {
        if (!debouncedSearch) return true;
        const searchLower = debouncedSearch.toLowerCase();
        return (
            employee.corporate_name.toLowerCase().includes(searchLower) ||
            employee.id.toLowerCase().includes(searchLower)
        );
    });

    const totalDocs = filteredEmployees.length;
    const totalPages = Math.ceil(totalDocs / pageSize);
    const offset = (currentPage - 1) * pageSize;
    const paginatedEmployees = filteredEmployees.slice(
        offset,
        offset + pageSize
    );

    const handleSubmit = () => {
        const selectedEmployeeData = selectedEmployee
            ? employeeList.find((emp) => emp.id === selectedEmployee)
            : undefined;

        onSubmit({
            discountType: activeTab,
            discountPercentage,
            selectedEmployee: selectedEmployeeData,
        });

        // Reset form
        setActiveTab("Global");
        setDiscountPercentage(0);
        setSelectedEmployee(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
    };

    const handleCancel = () => {
        setActiveTab("Global");
        setDiscountPercentage(0);
        setSelectedEmployee(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
        onClose();
    };

    const handleTabClick = (tab: "Global" | "Employee") => {
        setActiveTab(tab);
        setDiscountPercentage(0);
        setSelectedEmployee(null);
        setSearchInput("");
        setDebouncedSearch("");
        setCurrentPage(1);
    };

    const handleRowSelect = (employeeId: string) => {
        setSelectedEmployee(
            selectedEmployee === employeeId ? null : employeeId
        );
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

    const isSubmitDisabled =
        activeTab === "Global"
            ? discountPercentage <= 0
            : !selectedEmployee || discountPercentage <= 0;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Employee Discount
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Tab Navigation */}
                    <div className="flex mb-6">
                        <button
                            onClick={() => handleTabClick("Global")}
                            className={`flex-1 py-3 px-4 rounded-l-lg font-medium transition-all ${
                                activeTab === "Global"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => handleTabClick("Employee")}
                            className={`flex-1 py-3 px-4 rounded-r-lg font-medium transition-all ${
                                activeTab === "Employee"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            Employee
                        </button>
                    </div>

                    {/* Global Tab Content */}
                    {activeTab === "Global" && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Discount
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={discountPercentage}
                                    onChange={(e) =>
                                        setDiscountPercentage(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full pr-10 bg-gray-100 border-gray-300 h-12 text-center text-lg font-medium"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">
                                    %
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Employee Tab Content */}
                    {activeTab === "Employee" && (
                        <div className="space-y-6">
                            {/* Search Input */}
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search Employee Name"
                                    className="pl-10 bg-[#F5F5F5] border-none h-12"
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                />
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                            </div>

                            {/* Employee Table */}
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
                                                            Loading employees...
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paginatedEmployees.length > 0 ? (
                                            paginatedEmployees.map(
                                                (employee, index) => (
                                                    <tr
                                                        key={employee.id}
                                                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                                            selectedEmployee ===
                                                            employee.id
                                                                ? "bg-blue-50 border-2 border-blue-400"
                                                                : "border-2 border-transparent"
                                                        }`}
                                                        onClick={() =>
                                                            handleRowSelect(
                                                                employee.id
                                                            )
                                                        }
                                                    >
                                                        <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                                                            {employee.id}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-900">
                                                            {formatCorporateName(
                                                                employee.corporate_name
                                                            )}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600">
                                                            {employee.rules}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600">
                                                            {employee.rules1}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600">
                                                            {employee.piutang
                                                                ? "TRUE"
                                                                : "FALSE"}
                                                        </td>
                                                        <td className="h-[48px] px-4 text-sm text-gray-600">
                                                            {employee.margin
                                                                ? "TRUE"
                                                                : "FALSE"}
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="p-8 text-center text-gray-500"
                                                >
                                                    {debouncedSearch
                                                        ? "No employees found for your search."
                                                        : "No employees found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {paginatedEmployees.length > 0 && (
                                <div className="flex justify-between items-center">
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
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage - 1
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ‹
                                            </button>

                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        totalPages
                                                    ),
                                                },
                                                (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage <= 3
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage >=
                                                        totalPages - 2
                                                    ) {
                                                        pageNum =
                                                            totalPages - 4 + i;
                                                    } else {
                                                        pageNum =
                                                            currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    pageNum
                                                                )
                                                            }
                                                            className={`h-8 w-8 flex items-center justify-center rounded-md text-sm ${
                                                                currentPage ===
                                                                pageNum
                                                                    ? "bg-blue-500 text-white"
                                                                    : "hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                }
                                            )}

                                            {totalPages > 5 &&
                                                currentPage <
                                                    totalPages - 2 && (
                                                    <>
                                                        <span className="px-2">
                                                            ...
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    totalPages
                                                                )
                                                            }
                                                            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100"
                                                        >
                                                            {totalPages}
                                                        </button>
                                                    </>
                                                )}

                                            <button
                                                onClick={() =>
                                                    handlePageChange(
                                                        currentPage + 1
                                                    )
                                                }
                                                disabled={
                                                    currentPage === totalPages
                                                }
                                                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Discount Input for Employee Tab */}
                            {selectedEmployee && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Discount for Selected Employee
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={discountPercentage}
                                            onChange={(e) =>
                                                setDiscountPercentage(
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="w-full pr-10 bg-gray-100 border-gray-300 h-12 text-center text-lg font-medium"
                                            min="0"
                                            max="100"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">
                                            %
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
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
                        disabled={isSubmitDisabled}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GlobalDiscountDialog;
