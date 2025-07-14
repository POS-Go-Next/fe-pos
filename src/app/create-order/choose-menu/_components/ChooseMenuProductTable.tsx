// app/create-order/choose-menu/_components/ChooseMenuProductTable.tsx - UPDATED WITHOUT FIXED ACTION COLUMN
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import BranchWideStockDialog from "@/components/shared/branch-wide-stock-dialog";
import MedicationDetailsDialog from "@/components/shared/medication-details-dialog";
import ProductTypeSelector from "@/components/shared/ProductTypeSelector";
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

// Enhanced Product Action Icons with delete functionality
const ProductActionIcons = ({
  productName,
  onBranchStockClick,
  onMedicationDetailsClick,
  onDeleteClick,
  showIcons = true,
}: {
  productName: string;
  onBranchStockClick: () => void;
  onMedicationDetailsClick: () => void;
  onDeleteClick: () => void;
  showIcons?: boolean;
}) => {
  if (!showIcons) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Delete Icon - NEW POSITION */}
      <button
        className="w-8 h-8 bg-red-100 rounded flex items-center justify-center hover:bg-red-200 transition-colors cursor-pointer"
        onClick={onDeleteClick}
        title="Delete Product"
      >
        <Trash className="w-4 h-4 text-red-600" />
      </button>

      {/* Package Icon - Branch Wide Stock */}
      <button
        className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
        onClick={onBranchStockClick}
        title="View Branch Wide Stock"
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </button>

      {/* Document Icon - Medication Details */}
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
      {/* CUSTOM SCROLLBAR STYLES */}
      <style jsx>{`
        .custom-scrollbar {
          /* Custom scrollbar for webkit browsers */
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
          border: 1px solid #f1f5f9;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
      `}</style>
      <div className="bg-white rounded-2xl p-5 mb-6">
        <div className={`bg-white rounded-2xl overflow-hidden`}>
          {/* Main scrollable table with max height and custom scrollbar */}
          <div className="overflow-auto custom-scrollbar max-h-[400px]">
            <table className="w-full min-w-[1350px]">
              {/* Header - Sticky */}
              <thead className="sticky top-0 z-10">
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
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px] rounded-tr-2xl">
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
                                onDeleteClick={() =>
                                  onRemoveProduct(product.id)
                                }
                              />
                              <span
                                className="cursor-pointer hover:text-blue-600 text-sm font-medium truncate max-w-[180px]"
                                onClick={() => onProductNameClick?.(product.id)}
                                title={product.name}
                              >
                                {product.name}
                              </span>
                            </>
                          ) : (
                            <div className="flex items-center gap-3 w-full">
                              <button
                                className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                                onClick={handleSearchFieldClick}
                                title="Add Product"
                              >
                                <Plus className="w-5 h-5 text-blue-600" />
                              </button>
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
                      <td className="p-3 text-sm font-bold">
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
