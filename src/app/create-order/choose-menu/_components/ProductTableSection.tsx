"use client";

import { FC } from "react";
import { ChooseMenuProductTable } from "./";
import { Product } from "./ChooseMenuProductTable";
import SelectProductDialog from "@/components/shared/select-product-dialog";

interface ProductTableSectionProps {
  products: Product[];
  onQuantityChange: (id: number, value: number) => void;
  onRemoveProduct: (id: number) => void;
  onProductNameClick: (id: number) => void;
  isProductDialogOpen: boolean;
  selectedProductId: number | null;
  onCloseProductDialog: () => void;
  onProductSelect: (product: any, productId: number) => void;
  className?: string;
}

const ProductTableSection: FC<ProductTableSectionProps> = ({
  products,
  onQuantityChange,
  onRemoveProduct,
  onProductNameClick,
  isProductDialogOpen,
  selectedProductId,
  onCloseProductDialog,
  onProductSelect,
  className = "",
}) => {
  return (
    <>
      <ChooseMenuProductTable
        products={products}
        onQuantityChange={onQuantityChange}
        onRemoveProduct={onRemoveProduct}
        onProductNameClick={onProductNameClick}
        className={className}
      />

      {/* Product Selection Dialog */}
      <SelectProductDialog
        isOpen={isProductDialogOpen}
        onClose={onCloseProductDialog}
        onSelectProduct={(selectedProduct) => {
          if (selectedProductId !== null) {
            onProductSelect(selectedProduct, selectedProductId);
          }
        }}
      />
    </>
  );
};

export default ProductTableSection;