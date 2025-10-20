"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReturnTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (returnType: "item-based" | "full-return", returnReason?: string) => void;
  transactionData?: {
    invoice_number: string;
    customer_name: string;
    date: string;
    time: string;
  };
}

export default function ReturnTypeDialog({
  isOpen,
  onClose,
  onConfirm,
}: ReturnTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<"item-based" | "full-return">("item-based");

  const handleConfirm = () => {
    onConfirm(selectedType, undefined);
  };

  const handleClose = () => {
    setSelectedType("item-based");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Return Type
          </h2>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedType("item-based")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  selectedType === "item-based"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Item-based
              </button>
              <button
                onClick={() => setSelectedType("full-return")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  selectedType === "full-return"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Full return
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}