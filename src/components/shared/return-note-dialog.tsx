"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReturnNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (returnReason: string) => void;
  returnType: "item-based" | "full-return";
  transactionData?: {
    invoice_number: string;
    customer_name: string;
    date: string;
    time: string;
  };
}

export default function ReturnNoteDialog({
  isOpen,
  onClose,
  onConfirm,
  returnType,
  transactionData,
}: ReturnNoteDialogProps) {
  const [returnReason, setReturnReason] = useState("");

  const handleConfirm = () => {
    const reason = returnReason.trim() || "No reason provided";
    onConfirm(reason);
    setReturnReason("");
  };

  const handleClose = () => {
    setReturnReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Return Reason
          </h2>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {transactionData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice:</span>
                <span className="font-medium">{transactionData.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{transactionData.customer_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Return Type:</span>
                <span className="font-medium capitalize">{returnType.replace("-", " ")}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Return
            </label>
            <Input
              type="text"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Enter reason for return..."
              className="w-full bg-gray-50 border-gray-300 rounded-lg h-12"
              autoFocus
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">
              {returnReason.length}/100 characters
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Please provide a brief reason for this return. This will be recorded for audit purposes.
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
            Confirm Return
          </Button>
        </div>
      </div>
    </div>
  );
}