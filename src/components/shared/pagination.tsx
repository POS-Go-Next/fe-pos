"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 3,
  className = "",
}: PaginationProps) {
  // If there are no pages or totalPages is 0, don't render the component
  if (totalPages <= 0) return null;

  // Calculate the range of page numbers to display
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust startPage if we're at the end of the range
  if (totalPages - endPage < maxVisiblePages - (endPage - startPage + 1)) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Generate page numbers
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 mr-1"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </Button>

      {pageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          variant={currentPage === pageNumber ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${
            pageNumber !== startPage && pageNumber !== endPage ? "mx-1" : ""
          } ${currentPage === pageNumber ? "bg-blue-500" : ""}`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 ml-1"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
