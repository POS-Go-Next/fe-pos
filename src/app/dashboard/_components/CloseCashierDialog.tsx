"use client";

import { FC, useState } from "react";
import { X, Search } from "lucide-react";
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

interface CloseCashierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const CloseCashierDialog: FC<CloseCashierDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Data kasir (statis untuk contoh)
  const cashierData: CashierData = {
    cashierName: "Abir Hussain",
    cashierCode: "Abir Hussain",
    kassa: "1",
    shift: "2",
    openTime: "07:00:01",
    closingTime: "1:00:097",
    date: "August 17, 2025",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Dialog */}
      <div className="bg-white rounded-lg w-full max-w-4xl relative z-10">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-[#202325]">
            Close Cashier (Tutup Kasir)
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

          {/* Table Row */}
          <div className="grid grid-cols-7 p-4 border-b">
            <div>{cashierData.cashierName}</div>
            <div>{cashierData.cashierCode}</div>
            <div>{cashierData.kassa}</div>
            <div>{cashierData.shift}</div>
            <div>{cashierData.openTime}</div>
            <div>{cashierData.closingTime}</div>
            <div>{cashierData.date}</div>
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

export default CloseCashierDialog;