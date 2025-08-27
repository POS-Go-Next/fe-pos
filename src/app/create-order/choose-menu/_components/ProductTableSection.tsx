// app/create-order/choose-menu/_components/ProductTableSection.tsx - UPDATED WITH onMiscChange
"use client";

import { FC } from "react";
import { ChooseMenuProductTable } from "./";
import type { ProductTableItem } from "@/types/stock";

interface ProductTableSectionProps {
    products: ProductTableItem[];
    onQuantityChange: (id: number, value: number) => void;
    onQuantityBlur?: () => void;
    onQuantityKeyPress?: (e: React.KeyboardEvent) => void;
    onRemoveProduct: (id: number) => void;
    onProductNameClick: (id: number) => void;
    onProductSelect: (product: any, productId: number) => void;
    onTypeChange: (id: number, type: string) => void;
    onDiscountChange?: (id: number, discount: number) => void;
    onMiscChange?: (id: number, miscAmount: number) => void; // 🔥 NEW: Add onMiscChange prop
    className?: string;
}

const ProductTableSection: FC<ProductTableSectionProps> = ({
    products,
    onQuantityChange,
    onQuantityBlur,
    onQuantityKeyPress,
    onRemoveProduct,
    onProductNameClick,
    onProductSelect,
    onTypeChange,
    onDiscountChange,
    onMiscChange, // 🔥 NEW: Destructure onMiscChange
    className = "",
}) => {
    return (
        <div className={className}>
            <ChooseMenuProductTable
                products={products}
                onQuantityChange={onQuantityChange}
                onQuantityBlur={onQuantityBlur}
                onQuantityKeyPress={onQuantityKeyPress}
                onRemoveProduct={onRemoveProduct}
                onProductNameClick={onProductNameClick}
                onProductSelect={onProductSelect}
                onTypeChange={onTypeChange}
                onDiscountChange={onDiscountChange}
                onMiscChange={onMiscChange} // 🔥 NEW: Pass onMiscChange to ChooseMenuProductTable
                className="h-full"
            />
        </div>
    );
};

export default ProductTableSection;
