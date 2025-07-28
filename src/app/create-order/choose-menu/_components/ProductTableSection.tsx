// app/create-order/choose-menu/_components/ProductTableSection.tsx
"use client";

import { FC } from "react";
import { ChooseMenuProductTable } from "./";
import { Product } from "./ChooseMenuProductTable";

interface ProductTableSectionProps {
  products: Product[];
  onQuantityChange: (id: number, value: number) => void;
  onQuantityBlur?: () => void; // ✅ NEW: Add quantity blur handler
  onQuantityKeyPress?: (e: React.KeyboardEvent) => void; // ✅ NEW: Add quantity key press handler
  onRemoveProduct: (id: number) => void;
  onProductNameClick: (id: number) => void;
  onProductSelect: (product: any, productId: number) => void;
  onTypeChange: (id: number, type: string) => void;
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
        className="h-full"
      />
    </div>
  );
};

export default ProductTableSection;
