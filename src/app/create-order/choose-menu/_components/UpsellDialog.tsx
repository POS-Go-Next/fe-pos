// app/create-order/choose-menu/_components/UpsellDialog.tsx
"use client";

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpsellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
}

const UpsellDialog: React.FC<UpsellDialogProps> = ({ 
  isOpen, 
  onClose,
  onConfirm,
  productName = "Selected Product"
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Set as Upselling?</h2>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            This will mark the selected item as an upselling product.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellDialog;