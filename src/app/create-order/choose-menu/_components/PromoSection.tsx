"use client";

import { FC, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Promo } from "@/components/shared/promo-table";

interface PromoSectionProps {
  promos: Promo[];
}

const PromoSection: FC<PromoSectionProps> = ({ promos }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full h-full">
      {/* Search Section */}
      <div className="flex pb-2">
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
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
          Search
        </Button>
      </div>

      {/* Promo Table Header */}
      <div className="grid grid-cols-12 py-3 px-4 text-sm font-medium text-gray-600 bg-[#F5F5F5] w-full rounded-t-lg">
        <div className="col-span-2">Promo ID</div>
        <div className="col-span-3">Product Name</div>
        <div className="col-span-3">Promo Type</div>
        <div className="col-span-2">Start Date</div>
        <div className="col-span-2">End Date</div>
      </div>

      {/* Promo Table Body */}
      <div className="w-full">
        {promos.slice(0, 3).map((promo, index) => (
          <div
            key={promo.id}
            className={`grid grid-cols-12 py-3 px-4 items-center text-sm cursor-pointer hover:bg-blue-50 ${
              index % 2 === 1 ? "bg-gray-50/50" : ""
            } ${index === 2 ? "rounded-b-lg" : ""}`}
          >
            <div className="col-span-2">{promo.id}</div>
            <div className="col-span-3">{promo.name}</div>
            <div className="col-span-3">{promo.type}</div>
            <div className="col-span-2">{promo.startDate}</div>
            <div className="col-span-2">{promo.endDate}</div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center py-4 items-center w-full">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-500 text-white mr-1">
          1
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1">
          2
        </button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1">
          3
        </button>
        <span className="mx-1">...</span>

        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 ml-1">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PromoSection;
