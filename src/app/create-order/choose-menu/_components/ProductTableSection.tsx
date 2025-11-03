"use client";

import { FC } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChooseMenuProductTable } from "./";
import type { ProductTableItem, StockData } from "@/types/stock";
import type { TransactionCorrectionWithReturnType } from "./TransactionCorrectionDialog";

interface ProductTableSectionProps {
  products: ProductTableItem[];
  onQuantityChange: (id: number, value: number) => void;
  onQuantityBlur?: () => void;
  onQuantityKeyPress?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  onRemoveProduct: (id: number) => void;
  onUndeleteProduct?: (id: number) => void;
  onProductSelect: (product: StockData) => void;
  onTypeChange: (id: number, type: string) => void;
  onDiscountChange?: (id: number, discount: number) => void;
  onMiscChange?: (id: number, miscAmount: number) => void;
  onUpsellingChange?: (id: number) => void;
  onTransactionReturn?: (transactionData: TransactionCorrectionWithReturnType, returnType: "item-based" | "full-return") => void;
  onPromoApply?: (id: number, promoData: {
    noPromo: string;
    discPromo: number;
    valuePromo: number;
    promoType: string;
  }) => void;
  className?: string;
}

const ProductTableSection: FC<ProductTableSectionProps> = ({
  products,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyPress,
  onRemoveProduct,
  onUndeleteProduct,
  onProductSelect,
  onTypeChange,
  onDiscountChange,
  onMiscChange,
  onUpsellingChange,
  onTransactionReturn,
  onPromoApply,
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
        onUndeleteProduct={onUndeleteProduct}
        onProductSelect={onProductSelect}
        onTypeChange={onTypeChange}
        onDiscountChange={onDiscountChange}
        onMiscChange={onMiscChange}
        onUpsellingChange={onUpsellingChange}
        onTransactionReturn={onTransactionReturn}
        onPromoApply={onPromoApply}
        className="h-full"
      />
    </div>
  );
};

export default ProductTableSection;
