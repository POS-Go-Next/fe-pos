"use client";

import { FC, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SuggestionsSection: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const suggestionProducts = [
    { id: "SG001", name: "Ibuprofen 400mg", type: "Alternative", price: "Rp 8.000", reason: "Similar to current selection" },
    { id: "SG002", name: "Multivitamin Complex", type: "Complement", price: "Rp 35.000", reason: "Often bought together" },
    { id: "SG003", name: "Hand Sanitizer 60ml", type: "Related", price: "Rp 12.000", reason: "Health & hygiene" },
  ];

  return (
    <div className="p-4">
      <div className="flex mb-4">
        <div className="relative flex-grow mr-2">
          <Input
            type="text"
            placeholder="Search Product Name"
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

      <div>
        {/* Suggestions Table Header */}
        <div className="grid grid-cols-5 p-3 text-sm font-medium text-gray-600 bg-[#F5F5F5] rounded-xl">
          <div>Product ID</div>
          <div>Product Name</div>
          <div>Suggestion Type</div>
          <div>Price</div>
          <div>Reason</div>
        </div>

        {/* Suggestions Table Body */}
        <div>
          {suggestionProducts.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-5 p-3 items-center text-sm cursor-pointer hover:bg-blue-50 ${
                index % 2 === 1 ? "bg-gray-50/50" : ""
              }`}
            >
              <div>{item.id}</div>
              <div>{item.name}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.type === 'Alternative' ? 'bg-blue-100 text-blue-800' :
                  item.type === 'Complement' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {item.type}
                </span>
              </div>
              <div>{item.price}</div>
              <div className="text-gray-500 text-xs">{item.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsSection;