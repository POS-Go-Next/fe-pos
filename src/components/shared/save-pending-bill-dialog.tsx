"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavePendingBillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const SavePendingBillDialog: React.FC<SavePendingBillDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Save as Pending Bill
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="mb-6">
            <p className="text-gray-600 text-base leading-relaxed">
              All items will be removed from the current transaction and saved
              as a pending bill.
            </p>
            <p className="text-gray-600 text-base leading-relaxed mt-2">
              Do you want to continue?
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavePendingBillDialog;
