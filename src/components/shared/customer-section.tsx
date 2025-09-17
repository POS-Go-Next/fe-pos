"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Plus, Search, User } from "lucide-react";
import { DropdownPortal } from "./dropdown-portal";
import type { CustomerData as CustomerApiData } from "@/types/customer";

interface CustomerData {
    id: number;
    name: string;
    gender: string;
    age: string;
    phone: string;
    address: string;
    status: string;
}

interface CustomerSectionProps {
    customerForm: CustomerData;
    customerList: CustomerApiData[];
    selectedCustomerId: number | null;
    customerSearch: string;
    isCustomerDropdownOpen: boolean;
    isCustomerLoading: boolean;
    customerError: string | null;
    validationErrors: Record<string, string>;
    viewMode: "both" | "customer-only" | "doctor-only";
    isSubmitLoading: boolean;
    onCustomerChange: (field: keyof CustomerData, value: string) => void;
    onCustomerSelect: (customer: CustomerApiData) => void;
    onCustomerInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCustomerInputFocus: () => void;
    onCustomerButtonClick: () => void;
    setCustomerSearch: (value: string) => void;
    setIsCustomerDropdownOpen: (open: boolean) => void;
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({
    customerForm,
    customerList,
    selectedCustomerId,
    customerSearch,
    isCustomerDropdownOpen,
    isCustomerLoading,
    customerError,
    validationErrors,
    viewMode,
    isSubmitLoading,
    onCustomerChange,
    onCustomerSelect,
    onCustomerInputChange,
    onCustomerInputFocus,
    onCustomerButtonClick,
    setCustomerSearch,
    setIsCustomerDropdownOpen,
}) => {
    const customerContainerRef = useRef<HTMLDivElement>(null);

    const filteredCustomers = customerList.filter((customer) =>
        customer.nm_cust.toLowerCase().includes(customerSearch.toLowerCase())
    );

    return (
        <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
                viewMode === "doctor-only"
                    ? "max-h-0 opacity-0 pointer-events-none"
                    : "max-h-[2000px] opacity-100"
            }`}
        >
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">
                            Customer Info
                        </h3>
                        <span className="text-red-500 text-sm font-medium">
                            *Required
                        </span>
                    </div>
                    {viewMode === "both" && (
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                            onClick={onCustomerButtonClick}
                            disabled={isSubmitLoading}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Customer
                        </Button>
                    )}
                </div>

                {validationErrors.submit && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">
                            {validationErrors.submit}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        {viewMode === "customer-only" ? (
                            <Input
                                type="text"
                                placeholder="Enter Customer Name"
                                value={customerForm.name}
                                onChange={(e) =>
                                    onCustomerChange("name", e.target.value)
                                }
                                disabled={isSubmitLoading}
                                className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                    validationErrors.customerName
                                        ? "ring-2 ring-red-500"
                                        : ""
                                }`}
                            />
                        ) : (
                            <div
                                className="relative"
                                ref={customerContainerRef}
                            >
                                <Input
                                    type="text"
                                    placeholder="Enter Customer Name or Search"
                                    value={customerForm.name}
                                    onChange={onCustomerInputChange}
                                    onFocus={onCustomerInputFocus}
                                    disabled={isSubmitLoading}
                                    className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10 ${
                                        validationErrors.customerName
                                            ? "ring-2 ring-red-500"
                                            : ""
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsCustomerDropdownOpen(
                                            !isCustomerDropdownOpen
                                        )
                                    }
                                    disabled={isSubmitLoading}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </button>

                                <DropdownPortal
                                    isOpen={isCustomerDropdownOpen}
                                    triggerRef={customerContainerRef}
                                    onClose={() =>
                                        setIsCustomerDropdownOpen(false)
                                    }
                                >
                                    <div className="p-2 border-b border-gray-100 bg-white sticky top-0">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search customers..."
                                                value={customerSearch}
                                                onChange={(e) =>
                                                    setCustomerSearch(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="max-h-48 overflow-y-auto">
                                        {isCustomerLoading ? (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                Loading customers...
                                            </div>
                                        ) : customerError ? (
                                            <div className="px-3 py-2 text-sm text-red-500">
                                                Error: {customerError}
                                            </div>
                                        ) : filteredCustomers.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No customers found
                                            </div>
                                        ) : (
                                            filteredCustomers.map(
                                                (customer) => (
                                                    <button
                                                        key={customer.kd_cust}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            onCustomerSelect(
                                                                customer
                                                            );
                                                        }}
                                                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 transition-colors ${
                                                            selectedCustomerId ===
                                                            customer.kd_cust
                                                                ? "bg-blue-50 text-blue-600"
                                                                : "text-gray-900"
                                                        }`}
                                                    >
                                                        <div className="text-sm font-medium">
                                                            {customer.nm_cust}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {customer.gender ===
                                                            "male"
                                                                ? "Male"
                                                                : "Female"}{" "}
                                                            •{" "}
                                                            {customer.usia_cust}{" "}
                                                            years old
                                                        </div>
                                                    </button>
                                                )
                                            )
                                        )}
                                    </div>
                                </DropdownPortal>
                            </div>
                        )}
                        {validationErrors.customerName && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.customerName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                        </label>
                        <Select
                            value={customerForm.gender}
                            onValueChange={(value) =>
                                onCustomerChange("gender", value)
                            }
                            disabled={isSubmitLoading}
                        >
                            <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter Age Customer"
                            value={customerForm.age}
                            onChange={(e) =>
                                onCustomerChange("age", e.target.value)
                            }
                            disabled={isSubmitLoading}
                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                validationErrors.customerAge
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        />
                        {validationErrors.customerAge && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.customerAge}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="628214646757"
                            value={customerForm.phone}
                            onChange={(e) =>
                                onCustomerChange("phone", e.target.value)
                            }
                            disabled={isSubmitLoading}
                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                validationErrors.customerPhone
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        />
                        {validationErrors.customerPhone && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.customerPhone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter Address"
                            value={customerForm.address}
                            onChange={(e) =>
                                onCustomerChange("address", e.target.value)
                            }
                            disabled={isSubmitLoading}
                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                validationErrors.customerAddress
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        />
                        {validationErrors.customerAddress && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.customerAddress}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <Select
                            value={customerForm.status}
                            onValueChange={(value) =>
                                onCustomerChange("status", value)
                            }
                            disabled={isSubmitLoading}
                        >
                            <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">AKTIF</SelectItem>
                                <SelectItem value="false">
                                    TIDAK AKTIF
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
};
