// components/shared/stock-warning-dialog.tsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface StockWarningDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    warningType: "out-of-stock" | "insufficient-stock";
    availableStock?: number;
    requestedQuantity?: number;
}

export default function StockWarningDialog({
    isOpen,
    onClose,
    productName,
    warningType,
    availableStock = 0,
    requestedQuantity = 0,
}: StockWarningDialogProps) {
    if (!isOpen) return null;

    const getWarningMessage = () => {
        if (warningType === "out-of-stock") {
            return {
                title: "Stok Habis",
                message: `Produk "${productName}" saat ini stoknya kosong dan tidak tersedia untuk dijual.`,
                icon: "error",
            };
        } else {
            return {
                title: "Stok Tidak Mencukupi",
                message: `Produk "${productName}" hanya memiliki stok tersisa ${availableStock} unit. Anda meminta ${requestedQuantity} unit.`,
                icon: "warning",
            };
        }
    };

    const warning = getWarningMessage();

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-full ${
                                    warning.icon === "error"
                                        ? "bg-red-100"
                                        : "bg-orange-100"
                                }`}
                            >
                                <AlertTriangle
                                    className={`h-6 w-6 ${
                                        warning.icon === "error"
                                            ? "text-red-600"
                                            : "text-orange-600"
                                    }`}
                                />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {warning.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            {warning.message}
                        </p>

                        {warningType === "insufficient-stock" && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Saran:</span>{" "}
                                    Ubah quantity menjadi maksimal{" "}
                                    {availableStock} unit atau kurang.
                                </p>
                            </div>
                        )}

                        {warningType === "out-of-stock" && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    <span className="font-medium">Info:</span>{" "}
                                    Silakan pilih produk lain atau tunggu
                                    restock produk ini.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            OK, Mengerti
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
