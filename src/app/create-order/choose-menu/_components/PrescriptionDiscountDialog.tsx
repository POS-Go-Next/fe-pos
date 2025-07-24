// app/create-order/choose-menu/_components/PrescriptionDiscountDialog.tsx
"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PrescriptionDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sku: string;
    productName: string;
    discountMax: number;
    discount: number;
  }) => void;
}

const PrescriptionDiscountDialog: React.FC<PrescriptionDiscountDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [sku, setSku] = useState("002806");
  const [productName, setProductName] = useState("");
  const [discountMax, setDiscountMax] = useState(0);
  const [discount, setDiscount] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      sku,
      productName,
      discountMax,
      discount,
    });

    // Reset form
    setSku("002806");
    setProductName("");
    setDiscountMax(0);
    setDiscount(0);
  };

  const handleCancel = () => {
    // Reset form
    setSku("002806");
    setProductName("");
    setDiscountMax(0);
    setDiscount(0);
    onClose();
  };

  const isValidDiscount = discount <= 3 || discount > 3;
  const showWarning = discount > 3;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Prescription Discount
          </h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* SKU and Product Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <Input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-gray-100 border-gray-300"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <Input
                type="text"
                placeholder="Search Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full border-gray-300"
              />
            </div>
          </div>

          {/* Discount Max and Discount Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Max
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountMax}
                  onChange={(e) => setDiscountMax(Number(e.target.value))}
                  className="w-full pr-8 border-gray-300"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full pr-8 border-gray-300"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <span className="font-medium">
                  Discount &lt;= 3% AA ; Discount &gt; 3% OLM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-8 py-2 border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDiscountDialog;
