"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    X,
    ChevronDown,
    Eye,
    Trash2,
    ShoppingCart,
    Calendar,
    User,
    Phone,
    FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import Pagination from "@/components/shared/pagination";

interface PendingBillData {
    id: string;
    customerName: string;
    customerPhone: string;
    notes: string;
    products: Record<string, unknown>[];
    totalAmount: number;
    savedAt: string;
    createdDate: string;
    createdTime: string;
}

interface ViewPendingBillDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadBill?: (bill: PendingBillData) => void;
    onDeleteBill?: (billId: string) => void;
}

const ViewPendingBillDialog: React.FC<ViewPendingBillDialogProps> = ({
    isOpen,
    onClose,
    onLoadBill,
    onDeleteBill,
}) => {
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<string | null>(null);
    const [isLoading, _setIsLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const pageSizeOptions = [5, 10, 25, 50];
    const mockPendingBills: PendingBillData[] = React.useMemo(() => [
        {
            id: "PB001",
            customerName: "Andi Wijaya",
            customerPhone: "+62812345678",
            notes: "Resep untuk sakit kepala, ambil besok pagi",
            products: [
                { name: "Paracetamol 500mg", quantity: 2, price: 15000 },
                { name: "Vitamin C", quantity: 1, price: 25000 },
            ],
            totalAmount: 55000,
            savedAt: "2025-01-15T10:30:00.000Z",
            createdDate: "15/01/2025",
            createdTime: "10:30:15",
        },
        {
            id: "PB002",
            customerName: "Siti Rahayu",
            customerPhone: "+62856789012",
            notes: "Obat diabetes rutin, diambil setiap minggu",
            products: [
                { name: "Metformin 500mg", quantity: 1, price: 45000 },
                { name: "Glibenclamide", quantity: 1, price: 30000 },
            ],
            totalAmount: 75000,
            savedAt: "2025-01-14T14:15:00.000Z",
            createdDate: "14/01/2025",
            createdTime: "14:15:32",
        },
        {
            id: "PB003",
            customerName: "Budi Santoso",
            customerPhone: "+62823456789",
            notes: "",
            products: [
                { name: "Amoxicillin 500mg", quantity: 1, price: 35000 },
            ],
            totalAmount: 35000,
            savedAt: "2025-01-13T09:45:00.000Z",
            createdDate: "13/01/2025",
            createdTime: "09:45:20",
        },
    ], []);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setPageSize(10);
            setSearchInput("");
            setSearchTerm("");
            setSelectedBill(null);
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

    const filteredBills = React.useMemo(() => {
        if (!searchTerm) return mockPendingBills;

        return mockPendingBills.filter((bill) => {
            const customerName = bill.customerName?.toLowerCase() || "";
            const billId = bill.id?.toLowerCase() || "";
            const searchLower = searchTerm.toLowerCase();

            return (
                customerName.includes(searchLower) ||
                billId.includes(searchLower)
            );
        });
    }, [mockPendingBills, searchTerm]);

    const filteredTotalDocs = filteredBills.length;
    const filteredTotalPages = Math.ceil(filteredTotalDocs / pageSize);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const formatCurrency = (amount: number): string => {
        return `Rp ${amount.toLocaleString("id-ID")}`;
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > filteredTotalPages) return;
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

    const handleClose = () => {
        setSearchInput("");
        setSearchTerm("");
        setCurrentPage(1);
        setSelectedBill(null);
        onClose();
    };

    const handleRowClick = (billId: string) => {
        setSelectedBill(selectedBill === billId ? null : billId);
    };

    const handleLoadBill = (bill: PendingBillData) => {
        if (onLoadBill) {
            onLoadBill(bill);
        }
        handleClose();
    };

    const handleDeleteBill = (billId: string) => {
        if (confirm("Are you sure you want to delete this pending bill?")) {
            if (onDeleteBill) {
                onDeleteBill(billId);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            View Pending Bills
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="relative max-w-md">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search Customer Name or Bill ID (min 3 characters)"
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
                </div>

                <div className="flex-1 min-h-0 flex flex-col p-6">
                    <div className="flex-1 min-h-0 border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            ref={tableContainerRef}
                            className="h-full w-full overflow-auto"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#3b82f6 #f1f5f9",
                            }}
                        >
                            <table className="w-full border-collapse min-w-[1000px]">
                                <thead className="sticky top-0 z-10 bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[100px]">
                                            Bill ID
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[150px]">
                                            Customer Name
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Phone
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[80px]">
                                            Items
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[100px]">
                                            Total Amount
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[100px]">
                                            Date
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[80px]">
                                            Time
                                        </th>
                                        <th className="text-left h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[200px]">
                                            Notes
                                        </th>
                                        <th className="text-center h-[48px] px-4 text-sm font-medium text-gray-600 bg-gray-50 min-w-[120px]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="text-center py-20"
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <span className="ml-2 text-gray-600">
                                                        Loading pending bills...
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedBills.length > 0 ? (
                                        paginatedBills.map((bill, index) => (
                                            <tr
                                                key={bill.id}
                                                className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                                                    selectedBill === bill.id
                                                        ? "bg-blue-50 border-2 border-blue-400"
                                                        : "border-2 border-transparent"
                                                } ${
                                                    index % 2 === 1
                                                        ? "bg-gray-50/30"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleRowClick(bill.id)
                                                }
                                            >
                                                <td className="h-[48px] px-4 text-sm font-medium text-gray-900">
                                                    {bill.id}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        {bill.customerName}
                                                    </div>
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-500" />
                                                        {bill.customerPhone ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-center text-gray-600">
                                                    {bill.products.length}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm font-semibold text-green-600">
                                                    {formatCurrency(
                                                        bill.totalAmount
                                                    )}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        {bill.createdDate}
                                                    </div>
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    {bill.createdTime}
                                                </td>
                                                <td className="h-[48px] px-4 text-sm text-gray-600">
                                                    <div
                                                        className="max-w-[200px] truncate"
                                                        title={bill.notes}
                                                    >
                                                        {bill.notes ? (
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                                <span className="truncate">
                                                                    {bill.notes}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">
                                                                No notes
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="h-[48px] px-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLoadBill(
                                                                    bill
                                                                );
                                                            }}
                                                            className="w-8 h-8 bg-green-100 rounded flex items-center justify-center hover:bg-green-200 transition-colors"
                                                            title="Load Bill to Cart"
                                                        >
                                                            <ShoppingCart className="w-4 h-4 text-green-600" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteBill(
                                                                    bill.id
                                                                );
                                                            }}
                                                            className="w-8 h-8 bg-red-100 rounded flex items-center justify-center hover:bg-red-200 transition-colors"
                                                            title="Delete Bill"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="p-8 text-center text-gray-500"
                                            >
                                                {searchTerm &&
                                                searchInput.trim().length >= 3
                                                    ? "No pending bills found for your search."
                                                    : searchTerm &&
                                                      searchInput.trim()
                                                          .length > 0 &&
                                                      searchInput.trim()
                                                          .length < 3
                                                    ? "Please enter at least 3 characters to search."
                                                    : "No pending bills found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {paginatedBills.length > 0 && (
                        <div className="mt-4 flex justify-between items-center flex-shrink-0">
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
                                        from {filteredTotalDocs}
                                    </span>
                                </div>
                            </div>
                            {filteredTotalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={filteredTotalPages}
                                    onPageChange={handlePageChange}
                                    size="sm"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewPendingBillDialog;
