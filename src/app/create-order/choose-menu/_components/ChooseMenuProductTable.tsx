// app/create-order/choose-menu/_components/ChooseMenuProductTable.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import BranchWideStockDialog from "@/components/shared/branch-wide-stock-dialog";
import MedicationDetailsDialog from "@/components/shared/medication-details-dialog";
import ProductTypeSelector from "@/components/shared/ProductTypeSelector";
import ProductActionIcons from "@/components/shared/ProductActionIcons";
import SelectProductDialog from "@/components/shared/select-product-dialog";
import KeyboardShortcutGuide from "./KeyboardShortcutGuide";
import UpsellDialog from "./UpsellDialog";
import type { ProductTableItem } from "@/types/stock";

// Export Product interface for backward compatibility
export interface Product extends ProductTableItem {}

// Currency formatting utility
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null || isNaN(Number(amount))) {
    return "Rp 0";
  }

  try {
    const numAmount = Number(amount);
    return `Rp ${numAmount.toLocaleString("id-ID")}`;
  } catch (error) {
    return "Rp 0";
  }
};

interface ChooseMenuProductTableProps {
  products: ProductTableItem[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemoveProduct: (id: number) => void;
  onProductNameClick?: (id: number) => void;
  onProductSelect?: (product: any, productId: number) => void;
  className?: string;
}

export default function ChooseMenuProductTable({
  products,
  onQuantityChange,
  onRemoveProduct,
  onProductNameClick,
  onProductSelect,
  className = "",
}: ChooseMenuProductTableProps) {
  // State management
  const [isSelectProductDialogOpen, setIsSelectProductDialogOpen] =
    useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isBranchStockOpen, setIsBranchStockOpen] = useState(false);
  const [isMedicationDetailsOpen, setIsMedicationDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductTableItem | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [isShortcutGuideOpen, setIsShortcutGuideOpen] = useState(false);
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);

  // Event handlers
  const handleSearchFieldClick = () => {
    setSelectedProductId(999);
    setIsSelectProductDialogOpen(true);
  };

  const handleProductSelectFromDialog = (selectedProduct: any) => {
    if (onProductSelect && selectedProductId !== null) {
      onProductSelect(selectedProduct, selectedProductId);
    }
    setIsSelectProductDialogOpen(false);
    setSelectedProductId(null);
  };

  const handleBranchStockClick = (product: ProductTableItem) => {
    if (product.name) {
      setSelectedProduct(product);
      setIsBranchStockOpen(true);
    }
  };

  const handleMedicationDetailsClick = (product: ProductTableItem) => {
    if (product.name) {
      setSelectedProduct(product);
      setIsMedicationDetailsOpen(true);
    }
  };

  const handleRowClick = (product: ProductTableItem, index: number) => {
    setSelectedRowId(selectedRowId === product.id ? null : product.id);
  };

  const handleTypeChange = (productId: number, newType: string) => {
    console.log(`Product ${productId} type changed to ${newType}`);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F1" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (selectedRowId !== null) {
          setIsShortcutGuideOpen(true);
        }
        return;
      }

      if (event.key === "F6" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (selectedRowId !== null) {
          setIsUpsellDialogOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRowId]);

  // Create table data - search row + selected products
  const tableData = React.useMemo(() => {
    const searchRow = {
      id: 999,
      name: "",
      type: "R/",
      price: 0,
      quantity: 0,
      subtotal: 0,
      discount: 0,
      sc: 0,
      misc: 0,
      promo: 0,
      promoPercent: 0,
      up: "N",
      noVoucher: 0,
      total: 0,
    };

    return [searchRow, ...products];
  }, [products]);

  return (
    <>
      <div className={`${className} bg-white rounded-2xl overflow-hidden`}>
        {/* Container with fixed action column */}
        <div className="relative">
          {/* Main scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              {/* Header */}
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[50px] rounded-tl-2xl">
                    {/* Empty header for checkbox column */}
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[400px]">
                    Product Name
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[70px]">
                    Type
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px]">
                    Price
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[60px]">
                    Qty
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px]">
                    SubTotal
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[70px]">
                    Disc%
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[80px]">
                    SC
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[80px]">
                    Misc
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[80px]">
                    Promo
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[70px]">
                    Promo%
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[50px]">
                    Up
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[80px]">
                    NoVoucher
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px] pr-[140px]">
                    Total
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {tableData.map((product, index) => {
                  const hasProductData = !!product.name;

                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${
                        selectedRowId === product.id ? "bg-blue-50" : ""
                      } ${index % 2 === 1 ? "bg-gray-50/30" : ""}`}
                      onClick={() => handleRowClick(product, index)}
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        {hasProductData ? (
                          <input
                            type="checkbox"
                            checked={selectedRowId === product.id}
                            onChange={() => handleRowClick(product, index)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        ) : (
                          // Empty space for search row
                          <div className="w-4 h-4"></div>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {hasProductData ? (
                            <>
                              <ProductActionIcons
                                productName={product.name}
                                onBranchStockClick={() =>
                                  handleBranchStockClick(product)
                                }
                                onMedicationDetailsClick={() =>
                                  handleMedicationDetailsClick(product)
                                }
                              />
                              <span
                                className="cursor-pointer hover:text-blue-600 text-sm font-medium truncate max-w-[240px]"
                                onClick={() => onProductNameClick?.(product.id)}
                                title={product.name}
                              >
                                {product.name}
                              </span>
                            </>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <Input
                                placeholder="Cari nama produk disini"
                                className="border-gray-200 text-sm h-9 flex-1 cursor-pointer"
                                onClick={handleSearchFieldClick}
                                readOnly
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="p-3">
                        <ProductTypeSelector
                          type={product.type || "R/"}
                          onChange={(newType) =>
                            handleTypeChange(product.id, newType)
                          }
                          disabled={!product.name}
                        />
                      </td>

                      {/* Price */}
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.price)}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="p-3">
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            value={product.quantity || ""}
                            onChange={(e) =>
                              onQuantityChange(
                                product.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-12 text-sm border-gray-200 h-9 text-center"
                            min="0"
                          />
                        </div>
                      </td>

                      {/* Sub Total */}
                      <td className="p-3 text-sm font-semibold">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.subtotal)}
                        </div>
                      </td>

                      {/* Discount % */}
                      <td className="p-3">
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            value={product.discount || ""}
                            className="w-12 text-sm border-gray-200 h-9 text-center"
                            min="0"
                            max="100"
                          />
                        </div>
                      </td>

                      {/* SC */}
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.sc)}
                        </div>
                      </td>

                      {/* Misc */}
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.misc)}
                        </div>
                      </td>

                      {/* Promo */}
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.promo || 0)}
                        </div>
                      </td>

                      {/* Promo % */}
                      <td className="p-3 text-sm text-center">
                        {product.promoPercent || 0}%
                      </td>

                      {/* Up */}
                      <td className="p-3 text-sm text-center">
                        {product.up || "N"}
                      </td>

                      {/* No Voucher */}
                      <td className="p-3 text-sm text-center">
                        {product.noVoucher || 0}
                      </td>

                      {/* Total */}
                      <td className="p-3 text-sm font-bold pr-[140px]">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.total || product.subtotal)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fixed Action Column */}
          <div className="absolute top-0 right-0 w-[120px] bg-white shadow-lg rounded-tr-2xl">
            {/* Action Header */}
            <div className="bg-gray-100 p-3 text-sm font-medium text-gray-600 text-center border-b border-gray-200 rounded-tr-2xl">
              Action
            </div>

            {/* Action Buttons */}
            {tableData.map((product, index) => {
              const hasProductData = !!product.name;

              return (
                <div
                  key={`action-${product.id}`}
                  className={`p-4 border-b border-gray-100 flex items-center justify-center gap-2 ${
                    index % 2 === 1 ? "bg-gray-50/30" : ""
                  }`}
                >
                  {hasProductData ? (
                    // Product with data - show only DELETE button
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full bg-red-500 hover:bg-red-600"
                      onClick={() => onRemoveProduct(product.id)}
                    >
                      <Trash size={14} />
                    </Button>
                  ) : (
                    // Empty product - show only ADD button
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                      onClick={handleSearchFieldClick}
                    >
                      <Plus size={14} />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SelectProductDialog
        isOpen={isSelectProductDialogOpen}
        onClose={() => {
          setIsSelectProductDialogOpen(false);
          setSelectedProductId(null);
        }}
        onSelectProduct={handleProductSelectFromDialog}
      />

      <BranchWideStockDialog
        isOpen={isBranchStockOpen}
        onClose={() => setIsBranchStockOpen(false)}
        productName={selectedProduct?.name}
        retailPrice={formatCurrency(selectedProduct?.price)}
        wholesalePrice={formatCurrency(selectedProduct?.price)}
        quantity={selectedProduct?.quantity || 0}
        expiredDate="29/05/2030"
        units={selectedProduct?.stockData?.isi || 1}
        strips={selectedProduct?.stockData?.strip || 1}
        qtyFree={1}
      />

      <MedicationDetailsDialog
        isOpen={isMedicationDetailsOpen}
        onClose={() => setIsMedicationDetailsOpen(false)}
        productName={selectedProduct?.name}
      />

      <KeyboardShortcutGuide
        isOpen={isShortcutGuideOpen}
        onClose={() => setIsShortcutGuideOpen(false)}
      />

      <UpsellDialog
        isOpen={isUpsellDialogOpen}
        onClose={() => setIsUpsellDialogOpen(false)}
        onConfirm={() => {
          if (selectedRowId !== null) {
            console.log(
              `✅ Product ${selectedRowId} marked as upselling product`
            );
          }
        }}
        productName={selectedProduct?.name}
      />
    </>
  );
}
