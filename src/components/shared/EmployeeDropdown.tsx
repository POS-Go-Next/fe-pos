"use client";

import { FC, useCallback, useRef, useEffect } from "react";
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
    hasMoreData?: boolean;
    isLoadingMore?: boolean;
    onLoadMore?: () => void;
    totalCount?: number;
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
    hasMoreData = false,
    isLoadingMore = false,
    onLoadMore,
    totalCount = 0,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !hasMoreData || isLoadingMore || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMoreData && !isLoadingMore) {onLoadMore();
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: "20px",
                threshold: 0.1,
            }
        );

        const currentTrigger = loadingTriggerRef.current;
        if (currentTrigger) {
            observer.observe(currentTrigger);
        }

        return () => {
            if (currentTrigger) {
                observer.unobserve(currentTrigger);
            }
        };
    }, [isOpen, hasMoreData, isLoadingMore, onLoadMore]);

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (!hasMoreData || isLoadingMore || !onLoadMore) return;

            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;

            if (isNearBottom) {onLoadMore();
            }
        },
        [hasMoreData, isLoadingMore, onLoadMore]
    );

    const getStatusText = () => {
        if (!isAuthenticated) {
            return (
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    Authentication required. Please login again.
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading employees...
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    Error loading data
                </div>
            );
        }

        return selectedName || "Select User";
    };

    const getDropdownContent = () => {
        if (employees.length > 0) {
            return (
                <>
                    {employees.map((employee, index) => (
                        <button
                            key={`${employee.id}-${index}`}
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
                    ))}

                    {hasMoreData && (
                        <div
                            ref={loadingTriggerRef}
                            className="px-4 py-3 flex items-center justify-center border-b"
                        >
                            {isLoadingMore ? (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">
                                        Loading more...
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400">
                                    Scroll to load more...
                                </div>
                            )}
                        </div>
                    )}

                    {totalCount && totalCount > 0 && (
                        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t">
                            Showing {employees.length} of {totalCount} employees
                            {hasMoreData && " • Scroll for more"}
                        </div>
                    )}
                </>
            );
        }

        return (
            <div className="px-4 py-6 text-gray-500 text-center text-sm">
                {searchTerm
                    ? `No employees found for "${searchTerm}"`
                    : "No employees found"}
            </div>
        );
    };

    return (
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
                        className={
                            selectedName ? "text-gray-800" : "text-gray-500"
                        }
                    >
                        {getStatusText()}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                </button>

                {isOpen && !isLoading && !error && isAuthenticated && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-80 overflow-hidden mt-1">
                        <div className="p-3 border-b sticky top-0 bg-white z-10">
                            <Input
                                type="text"
                                placeholder="Search employee..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full text-sm"
                                autoFocus
                            />
                        </div>

                        <div
                            ref={scrollContainerRef}
                            className="max-h-64 overflow-y-auto"
                            onScroll={handleScroll}
                        >
                            {getDropdownContent()}
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
};

export default EmployeeDropdown;
