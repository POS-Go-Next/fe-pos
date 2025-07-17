// app/create-order/choose-menu/_components/ProductTableSection.tsx
"use client";

import { FC } from "react";
import { ChooseMenuProductTable } from "./";
import { Product } from "./ChooseMenuProductTable";

interface ProductTableSectionProps {
  products: Product[];
  onQuantityChange: (id: number, value: number) => void;
  onRemoveProduct: (id: number) => void;
  onProductNameClick: (id: number) => void;
  onProductSelect: (product: any, productId: number) => void;
  className?: string;
}

const ProductTableSection: FC<ProductTableSectionProps> = ({
  products,
  onQuantityChange,
  onRemoveProduct,
  onProductNameClick,
  onProductSelect,
  className = "",
}) => {
  return (
    <div className={className}>
      <ChooseMenuProductTable
        products={products}
        onQuantityChange={onQuantityChange}
        onRemoveProduct={onRemoveProduct}
        onProductNameClick={onProductNameClick}
        onProductSelect={onProductSelect}
        className="h-full"
      />
    </div>
  );
};

export default ProductTableSection;
