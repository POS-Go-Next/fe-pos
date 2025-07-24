"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingBillSavedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDone: () => void;
}

const PendingBillSavedDialog: React.FC<PendingBillSavedDialogProps> = ({
  isOpen,
  onClose,
  onDone,
}) => {
  if (!isOpen) return null;

  const handleDone = () => {
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pending Bill Saved !
          </h2>

          <div className="mb-8">
            <p className="text-gray-600 text-base leading-relaxed mb-2">
              This bill has been saved as pending.
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              You can proceed to the next transaction.
            </p>
          </div>

          <Button
            onClick={handleDone}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PendingBillSavedDialog;
