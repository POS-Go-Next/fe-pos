"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  dateAdded: string;
}

export default function SelectCustomerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample customer data
  const customers: Customer[] = [
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
  ];

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle customer selection
  const handleSelectCustomer = (_customer: Customer) => {
    router.back();
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-2">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Select Customer</h2>
        </div>
        <Button className="bg-blue-600">
          <Plus size={16} className="mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search here"
            className="pl-10 bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-4 bg-gray-100 p-4 font-medium text-gray-600">
        <div>Customer Name</div>
        <div>Phone Number</div>
        <div>Address</div>
        <div>Date added</div>
      </div>

      {/* Table rows */}
      <div className="overflow-y-auto">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-4 p-4 hover:bg-blue-50 cursor-pointer border-b"
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
      <div className="p-4 flex justify-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ArrowLeft size={16} />
        </Button>
        <Button
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          1
        </Button>
        <Button
          variant={currentPage === 2 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          2
        </Button>
        <Button
          variant={currentPage === 3 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          3
        </Button>
        <Button
          variant={currentPage === 4 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          4
        </Button>
        <Button
          variant={currentPage === 5 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          5
        </Button>
        <Button
          variant={currentPage === 6 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          6
        </Button>
        <Button
          variant={currentPage === 7 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          7
        </Button>
        <Button
          variant={currentPage === 8 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          8
        </Button>
        <Button
          variant={currentPage === 9 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          9
        </Button>
        <div className="flex items-center px-2">...</div>
        <Button
          variant={currentPage === 20 ? "default" : "outline"}
          size="sm"
          className="h-8 w-8"
        >
          20
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentPage(Math.min(20, currentPage + 1))}
          disabled={currentPage === 20}
        >
          <ArrowLeft size={16} className="rotate-180" />
        </Button>
      </div>
    </div>
  );
}
