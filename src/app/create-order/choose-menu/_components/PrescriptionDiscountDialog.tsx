"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PrescriptionDiscountDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (productId: number, discount: number) => void;
    selectedProduct?: {
        id: number;
        kode_brg?: string;
        nama_brg?: string;
        stockData?: { kode_brg?: string };
        name?: string;
    } | null;
}

const PrescriptionDiscountDialog: React.FC<PrescriptionDiscountDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    selectedProduct,
}) => {
    const [sku, setSku] = useState("");
    const [productName, setProductName] = useState("");
    const [discountMax, setDiscountMax] = useState(3);
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        try {
            const keys = ["user", "userData", "auth-user", "loginData"];
            let positionId = null;

            for (const key of keys) {
                const data =
                    localStorage.getItem(key) || sessionStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    positionId = parsed.position_id || parsed.user?.position_id;
                    if (positionId) break;
                }
            }

            setDiscountMax(positionId === 7 ? 10 : 3);
        } catch {
            setDiscountMax(3);
        }
    }, []);

    useEffect(() => {
        if (isOpen && selectedProduct) {
            setSku(
                selectedProduct.stockData?.kode_brg ||
                    selectedProduct.kode_brg ||
                    ""
            );
            setProductName(
                selectedProduct.nama_brg || selectedProduct.name || ""
            );
        }
    }, [isOpen, selectedProduct]);

    useEffect(() => {
        if (!isOpen) {
            setSku("");
            setProductName("");
            setDiscount(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedProduct?.id && discount > 0) {
            onSubmit(selectedProduct.id, discount);
        }
        setDiscount(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Prescription Discount
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SKU
                            </label>
                            <Input
                                type="text"
                                value={sku}
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
                                value={productName}
                                className="w-full bg-gray-100 border-gray-300"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Max
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={discountMax}
                                    className="w-full pr-8 bg-gray-100 border-gray-300"
                                    readOnly
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
                                    value={discount === 0 ? "" : discount}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        if (inputValue === "") {
                                            setDiscount(0);
                                            return;
                                        }
                                        const value = Number(inputValue);
                                        if (
                                            !isNaN(value) &&
                                            value >= 0 &&
                                            value <= discountMax
                                        ) {
                                            setDiscount(value);
                                        }
                                    }}
                                    className="w-full pr-8 border-gray-300"
                                    min="0"
                                    max={discountMax}
                                    placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                    %
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="text-red-700">
                                <span className="font-medium">
                                    Discount &lt;= {discountMax}% AA ; Discount
                                    &gt; {discountMax}% OLM
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-8 py-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={discount <= 0 || discount > discountMax}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionDiscountDialog;
