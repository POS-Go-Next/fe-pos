"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface Promo {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
}

interface PromoTableProps {
  promos: Promo[];
  className?: string;
}

export default function PromoTable({
  promos,
  className = "",
}: PromoTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPromos, setFilteredPromos] = useState<Promo[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const itemsPerPage = 3;

  // Initialize filteredPromos with all promos
  useEffect(() => {
    setFilteredPromos(promos);
  }, [promos]);

  // Handle search/clear button click
  const handleSearchToggle = () => {
    if (isSearchActive) {
      // Clear search
      setSearchTerm("");
      setFilteredPromos(promos);
      setIsSearchActive(false);
      setCurrentPage(1);
    } else {
      // Perform search
      const filtered = promos.filter(
        (promo) =>
          searchTerm === "" ||
          promo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPromos(filtered);
      setIsSearchActive(true);
      setCurrentPage(1);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPromos = filteredPromos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className={`bg-white p-4 rounded-2xl ${className}`}>
      <div className="flex mb-4">
        <div className="relative flex-grow mr-2">
          <Input
            type="text"
            placeholder="Search here"
            className="pl-10 bg-[#F5F5F5] border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <Button
          variant="default"
          onClick={handleSearchToggle}
          className={
            isSearchActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }
        >
          {isSearchActive ? "Clear" : "Search"}
        </Button>
      </div>

      <div>
        {/* Promo Table Header */}
        <div className="grid grid-cols-12 p-3 text-sm font-medium text-gray-600 bg-[#F5F5F5] rounded-xl">
          <div className="col-span-2">Promo ID</div>
          <div className="col-span-3">Product Name</div>
          <div className="col-span-3">Promo Type</div>
          <div className="col-span-2">Start Date</div>
          <div className="col-span-2">End Date</div>
        </div>

        {/* Promo Table Body */}
        <div>
          {filteredPromos.length > 0 ? (
            <>
              {paginatedPromos.map((promo, index) => (
                <div
                  key={promo.id}
                  className={`grid grid-cols-12 p-3 items-center text-sm cursor-pointer hover:bg-blue-50 ${
                    index % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <div className="col-span-2 w-10/12">{promo.id}</div>
                  <div className="col-span-3 w-10/12">{promo.name}</div>
                  <div className="col-span-3 w-10/12">{promo.type}</div>
                  <div className="col-span-2 w-10/12">{promo.startDate}</div>
                  <div className="col-span-2 w-10/12">{promo.endDate}</div>
                </div>
              ))}

              {/* Add empty rows if results exist but less than itemsPerPage */}
              {paginatedPromos.length < itemsPerPage &&
                Array.from({
                  length: itemsPerPage - paginatedPromos.length,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="grid grid-cols-12 p-3 items-center text-sm"
                  >
                    <div className="col-span-2"></div>
                    <div className="col-span-4"></div>
                    <div className="col-span-2"></div>
                    <div className="col-span-2"></div>
                    <div className="col-span-2"></div>
                  </div>
                ))}
            </>
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm">
              Data not found
            </div>
          )}
        </div>
      </div>

      {/* Pagination - only render if there are results */}
      {filteredPromos.length > 0 && (
        <div className="flex justify-center mt-4 items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 mr-1"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>

          {[...Array(Math.min(totalPages, 3))].map((_, i) => {
            const pageNumber = i + 1;
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 ${i === 1 ? "mx-1" : ""} ${
                  currentPage === pageNumber ? "bg-blue-500" : ""
                }`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 ml-1"
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
