import React, { useState } from "react";
import { Info, Trash, Plus, Package, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BranchWideStockDialog from "./branch-wide-stock-dialog";
import MedicationDetailsDialog from "./medication-details-dialog";

interface DialogProduct {
  id: string;
  sku: string;
  name: string;
  dept: string;
  satuan: string;
  hjEcer: string;
  hjSwalayan: string;
  hjPerpack: string;
  isi: string;
  strip: string;
  obbs: string;
  barcode: string;
}

// Export Product interface - FIX: Add export to make it available for import
export interface Product {
  id: number;
  name: string;
  type?: 'R/' | 'RC' | 'OTC' | string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
  sc: number;
  misc: number;
  promo?: number;
  promoPercent?: number;
  up?: string;
  noVoucher?: number;
  total?: number;
}

// Currency formatting utility - Back to standard format
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null || isNaN(Number(amount))) {
    return 'Rp 0';
  }
  
  try {
    const numAmount = Number(amount);
    return `Rp ${numAmount.toLocaleString('id-ID')}`;
  } catch (error) {
    return 'Rp 0';
  }
};

interface EnhancedProductTableProps {
  products: Product[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemoveProduct: (id: number) => void;
  onAddProduct?: (product: Product) => void;
  onProductNameClick?: (id: number) => void;
  onProductSelect?: (selectedProduct: DialogProduct, productId: number) => void;
  className?: string;
}

const ProductTypeSelector = ({ type, onChange }: { type: string; onChange: (type: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const types = ['R/', 'RC', 'OTC', 'RX'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium min-w-[60px] justify-between hover:border-gray-400 transition-colors"
      >
        {type || 'R/'}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 min-w-[80px]">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onChange(t);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductIcon = ({ productName, onBranchStockClick, onMedicationDetailsClick }: { 
  productName: string; 
  onBranchStockClick: () => void;
  onMedicationDetailsClick: () => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* First Icon - Package Box - CLICKABLE untuk buka Branch Wide Stock */}
      <button 
        className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
        onClick={onBranchStockClick}
        title="View Branch Wide Stock"
      >
        <Package className="w-5 h-5 text-blue-600" />
      </button>
      {/* Second Icon - Document/Receipt - CLICKABLE untuk buka Medication Details */}
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

export default function EnhancedProductTable({
  products,
  onQuantityChange,
  onRemoveProduct,
  onAddProduct,
  onProductNameClick,
  onProductSelect,
  className = "",
}: EnhancedProductTableProps) {
  // State untuk Branch Wide Stock Dialog
  const [isBranchStockOpen, setIsBranchStockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // State untuk Medication Details Dialog
  const [isMedicationDetailsOpen, setIsMedicationDetailsOpen] = useState(false);

  const handleProductNameClick = (productId: number) => {
    if (onProductNameClick) {
      onProductNameClick(productId);
    }
  };

  const handleTypeChange = (productId: number, newType: string) => {
    console.log(`Product ${productId} type changed to ${newType}`);
  };

  // Handler untuk icon Info (Branch Wide Stock) - DIPERBAIKI
  const handleBranchStockClick = (product: Product) => {
    if (product.name) { // Hanya jika product ada nama
      setSelectedProduct(product);
      setIsBranchStockOpen(true);
    }
  };

  // Handler untuk icon Document (Medication Details)
  const handleMedicationDetailsClick = (product: Product) => {
    if (product.name) { // Hanya jika product ada nama
      setSelectedProduct(product);
      setIsMedicationDetailsOpen(true);
    }
  };

  return (
    <>
      <div className={`${className} bg-white rounded-2xl overflow-hidden`}>
        {/* Container with fixed action column */}
        <div className="relative">
          {/* Main scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              {/* Header */}
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[280px] rounded-tl-2xl">Product Name</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[70px]">Type</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px]">Price</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[60px]">Qty</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px]">SubTotal</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[70px]">Disc%</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[80px]">SC</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[80px]">Misc</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[80px]">Promo</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[70px]">Promo%</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[50px]">Up</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[80px]">NoVoucher</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px] pr-[140px]">Total</th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody>
                {products.map((product, index) => (
                  <tr 
                    key={product.id}
                    className={`border-b border-gray-100 hover:bg-blue-50 ${
                      index % 2 === 1 ? "bg-gray-50/30" : ""
                    }`}
                  >
                    {/* Product Name */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {product.name ? (
                          <>
                            <ProductIcon 
                              productName={product.name}
                              onBranchStockClick={() => handleBranchStockClick(product)}
                              onMedicationDetailsClick={() => handleMedicationDetailsClick(product)}
                            />
                            <div className="flex items-center gap-2">
                              <span
                                className="cursor-pointer hover:text-blue-600 text-sm font-medium truncate max-w-[140px]"
                                onClick={() => handleProductNameClick(product.id)}
                                title={product.name}
                              >
                                {product.name}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-3 w-full">
                            <button 
                              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center cursor-not-allowed"
                              disabled
                              title="Select a product first"
                            >
                              <Package className="w-5 h-5 text-gray-400" />
                            </button>
                            <button 
                              className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center cursor-not-allowed"
                              disabled
                              title="Select a product first"
                            >
                              <svg 
                                className="w-5 h-5 text-gray-400" 
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
                            <Input
                              placeholder="Cari nama produk disini"
                              className="border-gray-200 text-sm h-9 flex-1"
                              onClick={() => handleProductNameClick(product.id)}
                              readOnly
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3">
                      {product.name ? (
                        <ProductTypeSelector
                          type={product.type || 'R/'}
                          onChange={(newType) => handleTypeChange(product.id, newType)}
                        />
                      ) : (
                        <div className="w-[50px] h-9 bg-white border border-gray-300 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">-</span>
                        </div>
                      )}
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
                            onQuantityChange(product.id, parseInt(e.target.value) || 0)
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
                    <td className="p-3 text-sm text-center">{product.promoPercent || 0}%</td>

                    {/* Up */}
                    <td className="p-3 text-sm text-center">{product.up || 'N'}</td>

                    {/* No Voucher */}
                    <td className="p-3 text-sm text-center">{product.noVoucher || 0}</td>

                    {/* Total */}
                    <td className="p-3 text-sm font-bold pr-[140px]">
                      <div className="whitespace-nowrap">
                        {formatCurrency(product.total || product.subtotal)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fixed Action Column with Shadow instead of Border */}
          <div className="absolute top-0 right-0 w-[120px] bg-white shadow-lg rounded-tr-2xl">
            {/* Action Header */}
            <div className="bg-gray-100 p-3 text-sm font-medium text-gray-600 text-center border-b border-gray-200 rounded-tr-2xl">
              Action
            </div>
            
            {/* Action Buttons */}
            {products.map((product, index) => (
              <div
                key={`action-${product.id}`}
                className={`p-4 border-b border-gray-100 flex items-center justify-center gap-2 ${
                  index % 2 === 1 ? "bg-gray-50/30" : ""
                }`}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-red-500 hover:bg-red-600"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  <Trash size={14} />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => onAddProduct && onAddProduct(product)}
                >
                  <Plus size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Wide Stock Dialog */}
      <BranchWideStockDialog
        isOpen={isBranchStockOpen}
        onClose={() => setIsBranchStockOpen(false)}
        productName={selectedProduct?.name}
        retailPrice={formatCurrency(selectedProduct?.price)}
        wholesalePrice={formatCurrency(selectedProduct?.price)}
        quantity={selectedProduct?.quantity || 0}
        expiredDate="29/05/2030"
        units={1}
        strips={12}
        qtyFree={1}
      />

      {/* Medication Details Dialog */}
      <MedicationDetailsDialog
        isOpen={isMedicationDetailsOpen}
        onClose={() => setIsMedicationDetailsOpen(false)}
        productName={selectedProduct?.name}
      />
    </>
  );
}