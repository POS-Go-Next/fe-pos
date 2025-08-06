// components/shared/transaction-type-dialog.tsx - ORIGINAL DESIGN
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionTypeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (transactionData: TransactionTypeData) => void;
}

export interface TransactionTypeData {
    medicineType: "Compounded" | "Ready to Use";
    transactionType: "Full Prescription" | "Partial Prescription";
    availability: "Available" | "Patient Credit";
}

const TransactionTypeDialog: React.FC<TransactionTypeDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [medicineType, setMedicineType] = useState<
        "Compounded" | "Ready to Use"
    >("Compounded");
    const [transactionType, setTransactionType] = useState<
        "Full Prescription" | "Partial Prescription"
    >("Full Prescription");
    const [availability, setAvailability] = useState<
        "Available" | "Patient Credit"
    >("Available");

    const handleSubmit = () => {
        const transactionData: TransactionTypeData = {
            medicineType,
            transactionType,
            availability,
        };

        onSubmit(transactionData);
    };

    const handleClose = () => {
        onClose();
        setMedicineType("Compounded");
        setTransactionType("Full Prescription");
        setAvailability("Available");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Transaction Type
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Medicine Type
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMedicineType("Compounded")}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    medicineType === "Compounded"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Compounded
                            </button>
                            <button
                                onClick={() => setMedicineType("Ready to Use")}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    medicineType === "Ready to Use"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Ready to Use
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Transaction Type
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    setTransactionType("Full Prescription")
                                }
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    transactionType === "Full Prescription"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Full Prescription
                            </button>
                            <button
                                onClick={() =>
                                    setTransactionType("Partial Prescription")
                                }
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    transactionType === "Partial Prescription"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Partial Prescription
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Availability / Patient Credit
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAvailability("Available")}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    availability === "Available"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Available
                            </button>
                            <button
                                onClick={() =>
                                    setAvailability("Patient Credit")
                                }
                                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                    availability === "Patient Credit"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                Patient Credit
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
                        onClick={handleSubmit}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TransactionTypeDialog;
