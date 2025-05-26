"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "./pagination";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  dateAdded: string;
}

interface SelectCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export default function SelectCustomerDialog({
  isOpen,
  onClose,
  onSelectCustomer,
}: SelectCustomerDialogProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Fixed customer data
  const customers: Customer[] = useMemo(
    () => [
      {
        id: 1,
        name: "Abir Hussain",
        phone: "(+62) 6388-44151",
        address: "Cikole, Sukabumi",
        dateAdded: "August 17, 2025",
      },
      {
        id: 2,
        name: "Adam Hamzah",
        phone: "(+62) 2081-70350",
        address: "Citamiang, Sukabumi",
        dateAdded: "August 14, 2025",
      },
      {
        id: 3,
        name: "Adrian Laporte",
        phone: "(+62) 6732-17017",
        address: "Baros, Sukabumi",
        dateAdded: "August 13, 2025",
      },
      {
        id: 4,
        name: "Amanda Reid",
        phone: "(+62) 8896-57724",
        address: "Baros, Sukabumi",
        dateAdded: "August 12, 2025",
      },
      {
        id: 5,
        name: "Billy Ward",
        phone: "(+62) 2012-16019",
        address: "Cikole, Sukabumi",
        dateAdded: "August 09, 2025",
      },
      {
        id: 6,
        name: "Benjamin Cook",
        phone: "(+62) 3242-88940",
        address: "Sukaraja, Sukabumi",
        dateAdded: "August 09, 2025",
      },
      {
        id: 7,
        name: "Callie Ouellat",
        phone: "(+62) 2759-49936",
        address: "Cikole, Sukabumi",
        dateAdded: "August 08, 2025",
      },
      {
        id: 8,
        name: "Charlotte Vincent",
        phone: "(+62) 8326-98085",
        address: "Citamiang, Sukabumi",
        dateAdded: "August 07, 2025",
      },
      // Add more customers to reach 20 if needed
      ...Array.from({ length: 12 }, (_, i) => ({
        id: i + 9,
        name: `Customer ${i + 9}`,
        phone: `(+62) ${1000 + i}-${10000 + i}`,
        address: `City ${i + 9}, Sukabumi`,
        dateAdded: `August ${20 - i}, 2025`,
      })),
    ],
    []
  );

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      searchTerm === "" ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setIsSearchActive(searchInput.trim() !== "");
    setCurrentPage(1);
  };

  // Handle search toggle (reset)
  const handleSearchToggle = () => {
    setSearchInput("");
    setSearchTerm("");
    setIsSearchActive(false);
    setCurrentPage(1);
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header - Outside white background */}
        <div className="flex items-center py-3">
          <button onClick={onClose} className="mr-4">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold flex-grow">Select Customer</h2>
          <Button className="bg-blue-600">
            <Plus size={16} className="mr-2" />
            Add Customer
          </Button>
        </div>

        {/* White background container */}
        <div className="bg-white rounded-lg overflow-hidden flex-grow flex flex-col p-4">
          {/* Search bar */}
          <div className="py-4">
            <div className="relative flex">
              <Input
                type="text"
                placeholder="Search here"
                className="pl-10 bg-[#F5F5F5] border-none flex-grow mr-2 h-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {isSearchActive ? (
                <Button
                  variant="destructive"
                  onClick={handleSearchToggle}
                  className="flex items-center h-10"
                >
                  <X size={16} className="mr-2" /> Reset
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleSearch}
                  className="flex items-center h-10"
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 bg-[#F5F5F5] py-2 px-4 rounded-lg font-medium text-gray-600">
            <div>Customer Name</div>
            <div>Phone Number</div>
            <div>Address</div>
            <div>Date added</div>
          </div>

          {/* Table rows */}
          <div className="flex-grow overflow-y-auto">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className={`grid grid-cols-4 p-4 hover:bg-blue-50 cursor-pointer ${
                    index % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div>{customer.name}</div>
                  <div>{customer.phone}</div>
                  <div>{customer.address}</div>
                  <div>{customer.dateAdded}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No customers found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="p-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
