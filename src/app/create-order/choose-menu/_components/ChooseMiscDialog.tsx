"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChooseMiscDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        medicationType: string;
        quantity: number;
        amount: number;
    }) => void;
}

const ChooseMiscDialog: React.FC<ChooseMiscDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [medicationType, setMedicationType] = useState(
        "Capsule Compound (Racikan Kapsul)"
    );
    const [quantity, setQuantity] = useState("");
    const [amount, setAmount] = useState("");
    const [baseAmount, setBaseAmount] = useState(400);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const medicationOptions = [
        "Capsule Compound (Racikan Kapsul)",
        "Tablet Compound (Racikan Tablet)",
        "Syrup Compound (Racikan Sirup)",
        "Powder Compound (Racikan Puyer)",
        "Cream Compound (Racikan Krim)",
        "Ointment Compound (Racikan Salep)",
    ];

    const getBaseAmount = (type: string): number => {
        switch (type) {
            case "Capsule Compound (Racikan Kapsul)":
                return 400;
            case "Powder Compound (Racikan Puyer)":
                return 400;
            default:
                return 0;
        }
    };

    useEffect(() => {
        const newBaseAmount = getBaseAmount(medicationType);
        setBaseAmount(newBaseAmount);
        if (quantity !== "") {
            const qty = Number(quantity) || 0;
            const newAmount = newBaseAmount * qty;
            setAmount(newAmount > 0 ? newAmount.toString() : "");
        } else if (newBaseAmount > 0) {
            setAmount("");
        } else {
            setAmount("");
        }
    }, [medicationType, quantity]);

    useEffect(() => {
        if (quantity !== "" && baseAmount > 0) {
            const qty = Number(quantity) || 0;
            const newAmount = baseAmount * qty;
            setAmount(newAmount > 0 ? newAmount.toString() : "");
        } else if (quantity === "") {
            setAmount("");
        }
    }, [quantity, baseAmount]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            medicationType,
            quantity: Number(quantity) || 0,
            amount: Number(amount) || 0,
        });

        setMedicationType("Capsule Compound (Racikan Kapsul)");
        setQuantity("");
        setAmount("");
        setBaseAmount(400);
    };

    const handleCancel = () => {
        setMedicationType("Capsule Compound (Racikan Kapsul)");
        setQuantity("");
        setAmount("");
        setBaseAmount(400);
        onClose();
    };

    const handleMedicationSelect = (option: string) => {
        setMedicationType(option);
        setIsDropdownOpen(false);
    };

    const handleQuantityChange = (value: string) => {
        if (value === "" || (/^\d*\.?\d*$/.test(value) && Number(value) >= 0)) {
            setQuantity(value);
        }
    };

    const handleAmountChange = (value: string) => {
        if (value === "" || (/^\d*\.?\d*$/.test(value) && Number(value) >= 0)) {
            setAmount(value);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Choose Misc
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medication Type
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <span className="text-gray-900">
                                    {medicationType}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                        isDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {medicationOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                handleMedicationSelect(option)
                                            }
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-gray-900"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                    handleQuantityChange(e.target.value)
                                }
                                className="w-full bg-gray-100 border-gray-300"
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                    Rp
                                </span>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) =>
                                        handleAmountChange(e.target.value)
                                    }
                                    className="w-full pl-8 bg-gray-100 border-gray-300"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

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

export default ChooseMiscDialog;
