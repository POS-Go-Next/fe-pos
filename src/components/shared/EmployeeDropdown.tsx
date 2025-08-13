// components/shared/EmployeeDropdown.tsx
"use client";

import { FC } from "react";
import { ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserData } from "@/types/user";

interface EmployeeDropdownProps {
    employees: UserData[];
    isLoading: boolean;
    error: string | null;
    isOpen: boolean;
    selectedName: string;
    searchTerm: string;
    onToggle: () => void;
    onSelect: (employee: UserData) => void;
    onSearchChange: (term: string) => void;
    onRetry: () => void;
    isAuthenticated: boolean;
}

const EmployeeDropdown: FC<EmployeeDropdownProps> = ({
    employees,
    isLoading,
    error,
    isOpen,
    selectedName,
    searchTerm,
    onToggle,
    onSelect,
    onSearchChange,
    onRetry,
    isAuthenticated,
}) => (
    <div className="mb-6 p-5 bg-white rounded-2xl">
        <label className="block text-gray-800 mb-2 font-medium">
            Employee Name
        </label>
        <div className="relative">
            <button
                onClick={onToggle}
                disabled={isLoading || !isAuthenticated}
                className={`w-full flex justify-between items-center text-left rounded-md py-4 px-4 transition-colors h-[52px] ${
                    isLoading || !isAuthenticated
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-[#F5F5F5] hover:bg-gray-200"
                }`}
            >
                <span
                    className={selectedName ? "text-gray-800" : "text-gray-500"}
                >
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            Authentication required. Please login again.
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading employees...
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            Error loading data
                        </div>
                    ) : (
                        selectedName || "Select User"
                    )}
                </span>
                <ChevronDown className="h-5 w-5 text-gray-500" />
            </button>

            {isOpen && !isLoading && !error && isAuthenticated && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-hidden mt-1">
                    <div className="p-3 border-b">
                        <Input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full text-sm"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <button
                                    key={employee.id}
                                    onClick={() => onSelect(employee)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                                >
                                    <div className="font-medium">
                                        {employee.fullname}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {employee.username}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-gray-500 text-center text-sm">
                                {searchTerm
                                    ? `No employees found for "${searchTerm}"`
                                    : "No employees found"}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-2 flex items-center gap-2">
                    <p className="text-red-500 text-xs flex-1">
                        {error.includes("Session expired")
                            ? "Authentication required. Please login again."
                            : "Failed to load employee data. Please try again."}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="text-xs h-7 px-2"
                    >
                        Retry
                    </Button>
                </div>
            )}
        </div>
    </div>
);

export default EmployeeDropdown;
