"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
    className?: string;
    size?: "sm" | "default" | "lg";
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 7,
    className = "",
    size = "sm",
}: PaginationProps) {
    if (totalPages <= 1) return null;

    if (currentPage < 1 || currentPage > totalPages) {
        console.warn(
            "Invalid currentPage:",
            currentPage,
            "totalPages:",
            totalPages
        );
        return null;
    }

    const sizeConfig = {
        sm: {
            button: "h-9 min-w-[36px] px-2 py-1",
            text: "text-sm",
            buttonSize: "sm" as const,
        },
        default: {
            button: "h-11 min-w-[44px] px-3 py-2",
            text: "text-base",
            buttonSize: "default" as const,
        },
        lg: {
            button: "h-13 min-w-[52px] px-4 py-3",
            text: "text-lg",
            buttonSize: "lg" as const,
        },
    };

    const config = sizeConfig[size];

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size={config.buttonSize}
                        className={`${config.button} ${config.text} ${
                            currentPage === i
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </Button>
                );
            }
        } else {
            pages.push(
                <Button
                    key={1}
                    variant={currentPage === 1 ? "default" : "outline"}
                    size={config.buttonSize}
                    className={`${config.button} ${config.text} ${
                        currentPage === 1
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </Button>
            );

            if (currentPage <= 3) {
                for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
                    pages.push(
                        <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size={config.buttonSize}
                            className={`${config.button} ${config.text} ${
                                currentPage === i
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </Button>
                    );
                }

                if (totalPages > 5) {
                    pages.push(
                        <Button
                            key="ellipsis"
                            variant="outline"
                            size={config.buttonSize}
                            className={`${config.button} ${config.text} border-gray-200 hover:bg-gray-50 text-gray-400`}
                            onClick={() =>
                                handlePageChange(
                                    Math.min(totalPages, currentPage + 5)
                                )
                            }
                            title={`Go to page ${Math.min(
                                totalPages,
                                currentPage + 5
                            )}`}
                        >
                            ...
                        </Button>
                    );
                }
            } else if (currentPage >= totalPages - 1) {
                if (totalPages > 4) {
                    pages.push(
                        <Button
                            key="ellipsis"
                            variant="outline"
                            size={config.buttonSize}
                            className={`${config.button} ${config.text} border-gray-200 hover:bg-gray-50 text-gray-400`}
                            onClick={() =>
                                handlePageChange(Math.max(1, currentPage - 5))
                            }
                            title={`Go to page ${Math.max(1, currentPage - 5)}`}
                        >
                            ...
                        </Button>
                    );
                }

                for (
                    let i = Math.max(2, totalPages - 2);
                    i <= totalPages - 1;
                    i++
                ) {
                    pages.push(
                        <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size={config.buttonSize}
                            className={`${config.button} ${config.text} ${
                                currentPage === i
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() => handlePageChange(i)}
                        >
                            {i}
                        </Button>
                    );
                }
            } else {
                pages.push(
                    <Button
                        key="ellipsis-before"
                        variant="outline"
                        size={config.buttonSize}
                        className={`${config.button} ${config.text} border-gray-200 hover:bg-gray-50 text-gray-400`}
                        onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 5))
                        }
                        title={`Go to page ${Math.max(1, currentPage - 5)}`}
                    >
                        ...
                    </Button>
                );

                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    if (i > 1 && i < totalPages) {
                        pages.push(
                            <Button
                                key={i}
                                variant={
                                    currentPage === i ? "default" : "outline"
                                }
                                size={config.buttonSize}
                                className={`${config.button} ${config.text} ${
                                    currentPage === i
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "border-gray-200 hover:bg-gray-50"
                                }`}
                                onClick={() => handlePageChange(i)}
                            >
                                {i}
                            </Button>
                        );
                    }
                }

                pages.push(
                    <Button
                        key="ellipsis-after"
                        variant="outline"
                        size={config.buttonSize}
                        className={`${config.button} ${config.text} border-gray-200 hover:bg-gray-50 text-gray-400`}
                        onClick={() =>
                            handlePageChange(
                                Math.min(totalPages, currentPage + 5)
                            )
                        }
                        title={`Go to page ${Math.min(
                            totalPages,
                            currentPage + 5
                        )}`}
                    >
                        ...
                    </Button>
                );
            }

            if (totalPages > 1) {
                pages.push(
                    <Button
                        key={totalPages}
                        variant={
                            currentPage === totalPages ? "default" : "outline"
                        }
                        size={config.buttonSize}
                        className={`${config.button} ${config.text} ${
                            currentPage === totalPages
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        {totalPages}
                    </Button>
                );
            }
        }

        return pages;
    };

    return (
        <div
            className={`flex justify-center items-center gap-1 px-4 py-2 ${className}`}
        >
            <Button
                variant="outline"
                size={config.buttonSize}
                className={`h-9 w-9 p-0 border-gray-200 hover:bg-gray-50 mr-2 flex-shrink-0 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous page"
            >
                <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center gap-1">{renderPageNumbers()}</div>

            <Button
                variant="outline"
                size={config.buttonSize}
                className={`h-9 w-9 p-0 border-gray-200 hover:bg-gray-50 ml-2 flex-shrink-0 ${
                    currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next page"
            >
                <ChevronRight size={16} />
            </Button>
        </div>
    );
}
