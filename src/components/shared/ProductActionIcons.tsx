"use client";

import React from "react";
import { Package } from "lucide-react";

interface ProductActionIconsProps {
    productName: string;
    onBranchStockClick: () => void;
    onMedicationDetailsClick: () => void;
    showIcons?: boolean;
}

const ProductActionIcons: React.FC<ProductActionIconsProps> = ({
    productName,
    onBranchStockClick,
    onMedicationDetailsClick,
    showIcons = true,
}) => {
    if (!showIcons) return null;

    return (
        <div className="flex items-center gap-2">
            <button
                className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                onClick={onBranchStockClick}
                title="View Branch Wide Stock"
            >
                <Package className="w-5 h-5 text-blue-600" />
            </button>

            <button
                className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                onClick={onMedicationDetailsClick}
                title="View Medication Details"
            >
                <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </button>
        </div>
    );
};

export default ProductActionIcons;
