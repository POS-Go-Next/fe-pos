"use client";

import { FC } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChooseMenuProductTable } from "./";
import type { ProductTableItem, StockData } from "@/types/stock";

interface ProductTableSectionProps {
  products: ProductTableItem[];
  onQuantityChange: (id: number, value: number) => void;
  onQuantityBlur?: () => void;
  onQuantityKeyPress?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  onRemoveProduct: (id: number) => void;
  onProductSelect: (product: StockData) => void;
  onTypeChange: (id: number, type: string) => void;
  onDiscountChange?: (id: number, discount: number) => void;
  onMiscChange?: (id: number, miscAmount: number) => void;
  onUpsellingChange?: (id: number) => void;
  className?: string;
}

const ProductTableSection: FC<ProductTableSectionProps> = ({
  products,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyPress,
  onRemoveProduct,
  onProductSelect,
  onTypeChange,
  onDiscountChange,
  onMiscChange,
  onUpsellingChange,
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
        onProductSelect={onProductSelect}
        onTypeChange={onTypeChange}
        onDiscountChange={onDiscountChange}
        onMiscChange={onMiscChange}
        onUpsellingChange={onUpsellingChange}
        className="h-full"
      />
    </div>
  );
};

export default ProductTableSection;
