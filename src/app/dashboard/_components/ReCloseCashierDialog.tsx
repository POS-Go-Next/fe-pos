"use client";

import { FC, useState } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CashierData {
  cashierName: string;
  cashierCode: string;
  kassa: string;
  shift: string;
  openTime: string;
  closingTime: string;
  date: string;
}

interface ReCloseCashierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const ReCloseCashierDialog: FC<ReCloseCashierDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data kasir (statis untuk contoh)
  const cashierData: CashierData[] = [
    {
      cashierName: "Adrian Laporte",
      cashierCode: "Adrian Laporte",
      kassa: "1",
      shift: "2",
      openTime: "07:00:01",
      closingTime: "1:00:097",
      date: "August 17, 2025",
    },
    {
      cashierName: "Abir Hussain",
      cashierCode: "Abir Hussain",
      kassa: "1",
      shift: "2",
      openTime: "07:00:01",
      closingTime: "1:00:097",
      date: "August 17, 2025",
    },
    {
      cashierName: "Benjamin Cook",
      cashierCode: "Benjamin Cook",
      kassa: "1",
      shift: "2",
      openTime: "07:00:01",
      closingTime: "1:00:097",
      date: "August 17, 2025",
    },
    {
      cashierName: "Billy Ward",
      cashierCode: "Billy Ward",
      kassa: "1",
      shift: "2",
      openTime: "07:00:01",
      closingTime: "1:00:097",
      date: "August 17, 2025",
    },
    {
      cashierName: "Callie Ouellet",
      cashierCode: "Callie Ouellet",
      kassa: "1",
      shift: "2",
      openTime: "07:00:01",
      closingTime: "1:00:097",
      date: "August 17, 2025",
    },
  ];

  const totalPages = 20; // Untuk contoh saja
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Dialog */}
      <div className="bg-white rounded-lg w-full max-w-4xl relative z-10">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-[#202325]">
            Re-Close Cashier (Tutup Kasir Ulang)
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search here"
              className="pl-10 bg-[#F5F5F5] border-none w-full"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          {/* Table Header */}
          <div className="bg-[#F5F5F5] grid grid-cols-7 py-2 px-4 rounded-lg font-medium text-gray-600">
            <div>Cashier Name</div>
            <div>Cashier Code</div>
            <div>Kassa</div>
            <div>Shift</div>
            <div>Open</div>
            <div>Closing</div>
            <div>Date</div>
          </div>

          {/* Table Rows */}
          {cashierData.map((data, index) => (
            <div 
              key={index}
              className={`grid grid-cols-7 p-4 border-b ${
                index % 2 === 1 ? "bg-blue-50" : ""
              }`}
            >
              <div>{data.cashierName}</div>
              <div>{data.cashierCode}</div>
              <div>{data.kassa}</div>
              <div>{data.shift}</div>
              <div>{data.openTime}</div>
              <div>{data.closingTime}</div>
              <div>{data.date}</div>
            </div>
          ))}
          
          {/* Pagination */}
          <div className="flex justify-end items-center mt-4 space-x-2">
            <button className="p-1 rounded-md hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              1
            </button>
            
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === 2 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              2
            </button>
            
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === 3 ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              3
            </button>
            
            <span className="mx-1">...</span>
            
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === totalPages ? "bg-blue-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>
            
            <button className="p-1 rounded-md hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4">
          <Button onClick={onSubmit} className="w-full bg-blue-600 py-6">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReCloseCashierDialog;