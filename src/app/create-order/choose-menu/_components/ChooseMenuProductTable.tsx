"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash, Plus, Package, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BranchWideStockDialog from "@/components/shared/branch-wide-stock-dialog";
import MedicationDetailsDialog from "@/components/shared/medication-details-dialog";
import Pagination from "@/components/shared/pagination";
import { useStock } from "@/hooks/useStock";
import type { StockData, ProductTableItem } from "@/types/stock";
import KeyboardShortcutGuide from "./KeyboardShortcutGuide";
import UpsellDialog from "./UpsellDialog";

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

// Re-export for backward compatibility
export interface Product extends ProductTableItem {}

// Currency formatting utility
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

// Convert API StockData to ProductTableItem interface
const convertStockToProduct = (stockItem: StockData, index: number): ProductTableItem => {
  return {
    id: index + 1,
    name: stockItem.nama_brg,
    type: stockItem.id_kategori === "001" ? "R/" : "RC",
    price: stockItem.hj_ecer,
    quantity: 0, // Default quantity
    subtotal: 0, // Will be calculated
    discount: 0,
    sc: 0,
    misc: 0,
    promo: 0,
    promoPercent: 0,
    up: 'N',
    noVoucher: 0,
    total: 0,
    stockData: stockItem, // Keep reference to original stock data
  };
};

interface ChooseMenuProductTableProps {
  products: ProductTableItem[];
  onQuantityChange: (id: number, quantity: number) => void;
  onRemoveProduct: (id: number) => void;
  onProductNameClick?: (id: number) => void;
  className?: string;
}

// FIXED: ProductTypeSelector dengan hanya R/ dan RC
const ProductTypeSelector = ({ type, onChange }: { type: string; onChange: (type: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  // FIXED: Hanya R/ dan RC
  const types = ['R/', 'RC'];

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (selectedType: string) => {
    onChange(selectedType);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm font-medium min-w-[60px] w-full justify-between hover:border-gray-400 transition-colors"
      >
        {type || 'R/'}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {/* Portal dropdown to body to avoid overflow issues */}
      {isOpen && buttonRect && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown positioned absolutely relative to viewport */}
          <div 
            className="fixed bg-white border border-gray-300 rounded-md shadow-2xl z-[9999] min-w-[80px] overflow-hidden"
            style={{
              top: buttonRect.bottom + window.scrollY + 4,
              left: buttonRect.left + window.scrollX,
              width: buttonRect.width
            }}
          >
            {types.map((t, index) => (
              <button
                key={t}
                onClick={() => handleSelect(t)}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap ${
                  index === 0 ? 'rounded-t-md' : ''
                } ${
                  index === types.length - 1 ? 'rounded-b-md' : ''
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

const ProductIcon = ({ productName, onBranchStockClick, onMedicationDetailsClick }: { 
  productName: string; 
  onBranchStockClick: () => void;
  onMedicationDetailsClick: () => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Package Icon - Branch Wide Stock */}
      <button 
        className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
        onClick={onBranchStockClick}
        title="View Branch Wide Stock"
      >
        <Package className="w-5 h-5 text-blue-600" />
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

export default function ChooseMenuProductTable({
  products,
  onQuantityChange,
  onRemoveProduct,
  onProductNameClick,
  className = "",
}: ChooseMenuProductTableProps) {
  // State untuk Branch Wide Stock Dialog
  const [isBranchStockOpen, setIsBranchStockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductTableItem | null>(null);

  // State untuk Medication Details Dialog
  const [isMedicationDetailsOpen, setIsMedicationDetailsOpen] = useState(false);

  // State untuk selected/clicked row
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // State untuk Keyboard Shortcut Guide
  const [isShortcutGuideOpen, setIsShortcutGuideOpen] = useState(false);

  // State untuk Upsell Dialog
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // API Integration using custom hook with pagination
  const [apiParams, setApiParams] = useState({ offset: 0, limit: 4 });
  const { 
    stockList, 
    isLoading, 
    error, 
    totalDocs,
    refetch 
  } = useStock(apiParams);

  // Convert API data to Product format
  const [allProducts, setAllProducts] = useState<ProductTableItem[]>([]);

  useEffect(() => {
    if (stockList.length > 0) {
      const convertedProducts = stockList.map((item, index) => 
        convertStockToProduct(item, (currentPage - 1) * apiParams.limit + index)
      );
      setAllProducts(convertedProducts);
    } else {
      setAllProducts([]);
    }
  }, [stockList, currentPage, apiParams.limit]);

  // FIXED: Enhanced page change handler with validation
  const handlePageChange = (newPage: number) => {
    // Validate page number
    if (newPage < 1) {
      console.warn('Invalid page number: cannot be less than 1');
      return;
    }

    // Calculate parameters BEFORE setting state
    let offset: number;
    let limit: number;
    
    if (newPage === 1) {
      // Page 1: search row + 4 products
      offset = 0;
      limit = 4;
    } else {
      // Page 2+: 5 products
      offset = 4 + (newPage - 2) * 5;
      limit = 5;
    }

    // FIXED: Validate offset against totalDocs
    if (totalDocs && offset >= totalDocs) {
      console.warn(`Invalid page ${newPage}: offset ${offset} >= totalDocs ${totalDocs}`);
      // Calculate the correct maximum page
      const maxValidPage = calculateActualTotalPages(totalDocs);
      if (newPage > maxValidPage) {
        console.log(`Redirecting to max valid page: ${maxValidPage}`);
        if (maxValidPage !== currentPage) {
          handlePageChange(maxValidPage);
        }
        return;
      }
    }

    console.log(`Page ${newPage}: offset=${offset}, limit=${limit}, totalDocs=${totalDocs}`);
    
    // Update states
    setCurrentPage(newPage);
    setApiParams({ offset, limit });
  };

  // FIXED: More accurate total pages calculation
  const calculateActualTotalPages = (totalDocs: number): number => {
    if (!totalDocs || totalDocs === 0) return 1;
    
    // Page 1 can show up to 4 items
    if (totalDocs <= 4) return 1;
    
    // For items > 4, we need additional pages
    // Each additional page shows 5 items
    const remainingItems = totalDocs - 4;
    const additionalPages = Math.ceil(remainingItems / 5);
    
    return 1 + additionalPages;
  };

  // FIXED: Validate calculated total pages
  const calculateTotalPages = (): number => {
    if (!totalDocs || totalDocs === 0) return 1;
    
    const calculatedPages = calculateActualTotalPages(totalDocs);
    
    // Double-check: make sure the last page has valid data
    if (calculatedPages > 1) {
      const lastPageOffset = 4 + (calculatedPages - 2) * 5;
      if (lastPageOffset >= totalDocs) {
        // Last page would be empty, reduce by 1
        return Math.max(1, calculatedPages - 1);
      }
    }
    
    return calculatedPages;
  };

  const handleProductNameClick = (productId: number) => {
    if (onProductNameClick) {
      onProductNameClick(productId);
    }
  };

  const handleTypeChange = (productId: number, newType: string) => {
    console.log(`Product ${productId} type changed to ${newType}`);
  };

  // FIXED: Handler untuk quantity change dengan kalkulasi subtotal dan total
  const handleQuantityChangeInternal = (productId: number, quantity: number) => {
    // Update product state untuk kalkulasi subtotal
    setAllProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          const newQuantity = Math.max(0, quantity); // Pastikan tidak negatif
          const newSubtotal = product.price * newQuantity;
          const newTotal = newSubtotal + product.sc + product.misc - product.discount - (product.promo || 0);
          
          return {
            ...product,
            quantity: newQuantity,
            subtotal: newSubtotal,
            total: newTotal
          };
        }
        return product;
      })
    );
    
    // Call parent handler
    onQuantityChange(productId, quantity);
  };

  // Handler untuk icon Info (Branch Wide Stock)
  const handleBranchStockClick = (product: ProductTableItem) => {
    if (product.name) {
      setSelectedProduct(product);
      setIsBranchStockOpen(true);
    }
  };

  // Handler untuk icon Document (Medication Details)
  const handleMedicationDetailsClick = (product: ProductTableItem) => {
    if (product.name) {
      setSelectedProduct(product);
      setIsMedicationDetailsOpen(true);
    }
  };

  // Handler untuk row click
  const handleRowClick = (productId: number) => {
    setSelectedRowId(selectedRowId === productId ? null : productId);
  };

  // Handler untuk upsell confirm
  const handleUpsellConfirm = () => {
    if (selectedRowId !== null) {
      console.log(`✅ Product ${selectedRowId} marked as upselling product`);
      // TODO: Update product data to mark as upselling
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Debug info untuk troubleshooting
      if (event.key === 'F1') {
        console.log('🔍 F1 Debug Info:', {
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          platform: navigator.platform,
          selectedRowId: selectedRowId
        });
      }

      // Ctrl+F1 (Windows) atau Cmd+F1 (Mac) - Show shortcuts guide hanya jika ada row selected
      // Juga support Fn+Cmd+F1 untuk Mac yang tidak mengubah system setting
      if (event.key === 'F1' && (event.ctrlKey || event.metaKey || (event.metaKey && event.getModifierState && event.getModifierState('Fn')))) {
        event.preventDefault();
        if (selectedRowId !== null) {
          console.log('✅ Ctrl/Cmd + F1: Show Keyboard Shortcuts Guide (Row selected)');
          setIsShortcutGuideOpen(true);
        } else {
          console.log('❌ Ctrl/Cmd + F1: No row selected, shortcuts guide not shown');
        }
        return; // Early return untuk mencegah F1 biasa
      }
      
      // F1 - Petunjuk Penggunaan Shortcut (tanpa modifier)
      if (event.key === 'F1' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        console.log('ℹ️ F1: Petunjuk Penggunaan Shortcut (without modifier)');
        // Bisa ditambahkan logic lain untuk F1 biasa jika diperlukan
      }

      // Alternative shortcut: Ctrl+H atau Cmd+H untuk help
      if (event.key.toLowerCase() === 'h' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (selectedRowId !== null) {
          console.log('✅ Ctrl/Cmd + H: Show Keyboard Shortcuts Guide (Row selected)');
          setIsShortcutGuideOpen(true);
        } else {
          console.log('❌ Ctrl/Cmd + H: No row selected, shortcuts guide not shown');
        }
        return;
      }
      
      // F2 - Bayar/Hystorical Transaksi
      if (event.key === 'F2') {
        event.preventDefault();
        console.log('F2: Bayar/Hystorical Transaksi');
        // TODO: Implement payment/history
      }
      
      // F3 - Discount (hanya untuk resep)
      if (event.key === 'F3') {
        event.preventDefault();
        console.log('F3: Discount (hanya untuk resep)');
        // TODO: Apply discount for prescription items
      }
      
      // Alt + F3 - Discount Global (hanya untuk resep)
      if (event.altKey && event.key === 'F3') {
        event.preventDefault();
        console.log('Alt + F3: Discount Global (hanya untuk resep)');
        // TODO: Apply global discount for prescription items
      }
      
      // F4 - Batal/Void (Clear Form Transaksi)
      if (event.key === 'F4') {
        event.preventDefault();
        console.log('F4: Batal/Void (Clear Form Transaksi)');
        // TODO: Clear transaction form
      }
      
      // F6 - Up Selling (dengan Cmd/Ctrl modifier)
      if (event.key === 'F6' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (selectedRowId !== null) {
          console.log('✅ Cmd/Ctrl + F6: Up Selling (Row selected)');
          setIsUpsellDialogOpen(true);
        } else {
          console.log('❌ Cmd/Ctrl + F6: No row selected, upselling dialog not shown');
        }
      }
      
      // F7 - Daftar Transaksi
      if (event.key === 'F7') {
        event.preventDefault();
        console.log('F7: Daftar Transaksi');
        // TODO: Show transaction list
      }
      
      // F8 - Koreksi Transaksi/Retur
      if (event.key === 'F8') {
        event.preventDefault();
        console.log('F8: Koreksi Transaksi/Retur');
        // TODO: Show correction/return form
      }
      
      // F9 - Tambah Bon Gantung
      if (event.key === 'F9') {
        event.preventDefault();
        console.log('F9: Tambah Bon Gantung');
        // TODO: Add pending transaction
      }
      
      // Alt + F9 - Lihat Bon Gantung
      if (event.altKey && event.key === 'F9') {
        event.preventDefault();
        console.log('Alt + F9: Lihat Bon Gantung');
        // TODO: View pending transactions
      }
      
      // F10 - Member Corporate
      if (event.key === 'F10') {
        event.preventDefault();
        console.log('F10: Member Corporate');
        // TODO: Show member corporate options
      }
      
      // F11 - Usulan barang baru
      if (event.key === 'F11') {
        event.preventDefault();
        console.log('F11: Usulan barang baru');
        // TODO: Show new item suggestion form
      }
      
      // F12 - Tambah Misc
      if (event.key === 'F12') {
        event.preventDefault();
        console.log('F12: Tambah Misc');
        // TODO: Add miscellaneous charge
      }
      
      // Alt + K - Menandakan Transaksi tidak biasa
      if (event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        console.log('Alt + K: Menandakan Transaksi tidak biasa');
        // TODO: Mark transaction as unusual
      }
      
      // Alt + R - Retur PerBarang
      if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        console.log('Alt + R: Retur PerBarang');
        // TODO: Return per item
      }
      
      // Alt + T - Retur Semua Barang
      if (event.altKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        console.log('Alt + T: Retur Semua Barang');
        // TODO: Return all items
      }
      
      // . (Titik) - Tambahkan SC (Service) Hanya Resep
      if (event.key === '.') {
        event.preventDefault();
        console.log('. (Titik): Tambahkan SC (Service) Hanya Resep');
        // TODO: Add service charge for prescription
      }
      
      // Alt + . (Alt + Titik) - Tambahkan SC (Service & Konsultasi)
      if (event.altKey && event.key === '.') {
        event.preventDefault();
        console.log('Alt + . (Alt + Titik): Tambahkan SC (Service & Konsultasi)');
        // TODO: Add service & consultation charge
      }
      
      // . . (Titik 2x) - RC (Racikan)
      // This would need special handling for double key press
      
      // , (Koma) - Delete SC (Hanya Resep)
      if (event.key === ',') {
        event.preventDefault();
        console.log(', (Koma): Delete SC (Hanya Resep)');
        // TODO: Delete service charge for prescription
      }
      
      // ~ (Tilde) - Calculator
      if (event.key === '~') {
        event.preventDefault();
        console.log('~ (Tilde): Calculator');
        // TODO: Toggle calculator
      }
      
      // / (Garis Miring) - Calculator Sederhana
      if (event.key === '/') {
        event.preventDefault();
        console.log('/ (Garis Miring): Calculator Sederhana');
        // TODO: Show simple calculator
      }
      
      // : (Titik Dua) - Setengah Resep
      if (event.key === ':') {
        event.preventDefault();
        console.log(': (Titik Dua): Setengah Resep');
        // TODO: Half prescription
      }
      
      // ; (Titik Koma) - Dua Kali Resep
      if (event.key === ';') {
        event.preventDefault();
        console.log('; (Titik Koma): Dua Kali Resep');
        // TODO: Double prescription
      }
      
      // Esc - Keluar
      if (event.key === 'Escape') {
        event.preventDefault();
        console.log('Esc: Keluar');
        // TODO: Exit/close current operation
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRowId]); // Tambahkan selectedRowId sebagai dependency

  // Use API data or fallback to props
  const displayProducts = allProducts.length > 0 ? allProducts : products;

  // FIXED: Use the corrected calculation
  const actualTotalPages = calculateTotalPages();

  // FIXED: Add effect to validate current page when totalDocs changes
  useEffect(() => {
    if (totalDocs && actualTotalPages > 0) {
      if (currentPage > actualTotalPages) {
        console.log(`Current page ${currentPage} exceeds max pages ${actualTotalPages}, redirecting to page ${actualTotalPages}`);
        handlePageChange(actualTotalPages);
      }
    }
  }, [totalDocs, actualTotalPages]);

  // Search field product (dummy for search row)
  const searchFieldProduct = { id: 999, name: "", price: 0, quantity: 0, discount: 0, sc: 0, misc: 0, subtotal: 0 };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} bg-white rounded-2xl shadow-sm border border-gray-100 p-6`}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${className} bg-white rounded-2xl shadow-sm border border-gray-100 p-6`}>
        <div className="flex flex-col items-center justify-center h-40">
          <div className="text-red-500 text-center mb-4">
            <p className="font-medium">Error loading products</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <Button 
            onClick={() => {
              console.log('Retrying with current params:', apiParams);
              refetch();
            }}
            variant="outline"
            size="sm"
            className="px-4 py-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // FIXED: Add debug info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Pagination Debug Info:', {
      currentPage,
      totalDocs,
      actualTotalPages,
      apiParams,
      displayProductsCount: displayProducts.length
    });
  }

  return (
    <>
      {/* Card Container yang bersih tanpa overflow kompleks */}
      <div className={`${className} bg-white rounded-2xl shadow-sm border border-gray-100 p-6`}>
        {/* Container with fixed action column */}
        <div className="relative">
          {/* Main scrollable table */}
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[1230px]">
              {/* Header */}
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-center p-3 text-sm font-medium text-gray-600 w-[50px]">
                    {/* Empty header untuk checkbox column */}
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[280px]">Product Name</th>
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
                  <th className="text-left p-3 text-sm font-medium text-gray-600 w-[100px] pr-[140px] rounded-tr-2xl">Total</th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody>
                {/* Search Field Row - Only show on page 1 */}
                {currentPage === 1 && (
                  <tr className="border-b border-gray-100">
                    {/* Checkbox - Disabled for search row */}
                    <td className="p-3 text-center">
                      <input 
                        type="checkbox" 
                        disabled 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 opacity-30" 
                      />
                    </td>
                    {/* Product Name - Search Field with Icon Space */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 w-full">
                        {/* Icon Space - Empty but maintain spacing */}
                        <div className="flex items-center gap-2 w-20">
                          <div className="w-8 h-8"></div>
                          <div className="w-8 h-8"></div>
                        </div>
                        <Input
                          placeholder="Cari nama produk disini"
                          className="border-gray-200 text-sm h-9 flex-1"
                          onClick={() => handleProductNameClick(searchFieldProduct.id)}
                          readOnly
                        />
                      </div>
                    </td>

                    {/* Empty cells for search row */}
                    <td className="p-3">
                      <div className="w-[50px] h-9 bg-white border border-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">-</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm"><div className="whitespace-nowrap">Rp 0</div></td>
                    <td className="p-3"><div className="flex justify-center"><Input type="number" value="" className="w-12 text-sm border-gray-200 h-9 text-center" min="0" disabled /></div></td>
                    <td className="p-3 text-sm font-semibold"><div className="whitespace-nowrap">Rp 0</div></td>
                    <td className="p-3"><div className="flex justify-center"><Input type="number" value="" className="w-12 text-sm border-gray-200 h-9 text-center" min="0" max="100" disabled /></div></td>
                    <td className="p-3 text-sm"><div className="whitespace-nowrap">Rp 0</div></td>
                    <td className="p-3 text-sm"><div className="whitespace-nowrap">Rp 0</div></td>
                    <td className="p-3 text-sm"><div className="whitespace-nowrap">Rp 0</div></td>
                    <td className="p-3 text-sm text-center">0%</td>
                    <td className="p-3 text-sm text-center">N</td>
                    <td className="p-3 text-sm text-center">0</td>
                    <td className="p-3 text-sm font-bold pr-[140px]"><div className="whitespace-nowrap">Rp 0</div></td>
                  </tr>
                )}

                {/* REMAINING ROWS: Products with Data Only */}
                {displayProducts.map((product, index) => {
                  // Adjust index for proper alternating row colors across pages
                  let globalIndex;
                  if (currentPage === 1) {
                    globalIndex = index + 1; // After search row
                  } else {
                    globalIndex = index; // No search row on other pages
                  }

                  // Check if this row is selected
                  const isSelected = selectedRowId === product.id;
                  
                  return (
                    <tr 
                      key={product.id}
                      onClick={() => handleRowClick(product.id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-blue-50" 
                          : globalIndex % 2 === 1 
                          ? "bg-gray-50/30 hover:bg-blue-50" 
                          : "hover:bg-blue-50"
                      }`}
                    >
                    {/* Checkbox */}
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleRowClick(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                    </td>
                    {/* Product Name */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
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
                      </div>
                    </td>

                    {/* Type dengan positioning yang diperbaiki */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <ProductTypeSelector
                        type={product.type || 'R/'}
                        onChange={(newType) => handleTypeChange(product.id, newType)}
                      />
                    </td>

                    {/* Price */}
                    <td className="p-3 text-sm">
                      <div className="whitespace-nowrap">
                        {formatCurrency(product.price)}
                      </div>
                    </td>

                    {/* Quantity - FIXED: Enable input dan kalkulasi subtotal */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          value={product.quantity || ""}
                          onChange={(e) =>
                            handleQuantityChangeInternal(product.id, parseInt(e.target.value) || 0)
                          }
                          className="w-12 text-sm border-gray-200 h-9 text-center"
                          min="0"
                        />
                      </div>
                    </td>

                    {/* Sub Total - FIXED: Show calculated subtotal */}
                    <td className="p-3 text-sm font-semibold">
                      <div className="whitespace-nowrap">
                        {formatCurrency(product.subtotal)}
                      </div>
                    </td>

                    {/* Discount % */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
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

                    {/* Total - FIXED: Show calculated total */}
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
          <div className="absolute top-0 right-0 w-16 bg-white shadow-lg">
            {/* Action Header */}
            <div className="bg-gray-100 p-3 text-sm font-medium text-gray-600 text-center border-b border-gray-200 rounded-tr-2xl">
              Action
            </div>
            
            {/* Action for Search Row - Only on page 1 */}
            {currentPage === 1 && (
              <div className="p-4 border-b border-gray-100 flex items-center justify-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleProductNameClick(searchFieldProduct.id)}
                >
                  <Plus size={14} />
                </Button>
              </div>
            )}

            {/* Action Buttons for Products */}
            {displayProducts.map((product, index) => {
              const isLastProduct = index === displayProducts.length - 1;
              return (
                <div
                  key={`action-${product.id}`}
                  className={`p-4 border-b border-gray-100 flex items-center justify-center gap-2 ${
                    currentPage === 1 ? (
                      index % 2 === 1 ? "bg-gray-50/30" : ""
                    ) : (
                      index % 2 === 1 ? "bg-gray-50/30" : ""
                    )
                  } ${isLastProduct ? 'rounded-br-2xl border-b-0' : ''}`}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-red-500 hover:bg-red-600"
                    onClick={() => onRemoveProduct(product.id)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={actualTotalPages}
          onPageChange={handlePageChange}
          maxVisiblePages={7}
          size="sm"
          className="mt-4"
        />
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
        units={selectedProduct?.stockData?.isi || 1}
        strips={selectedProduct?.stockData?.strip || 1}
        qtyFree={1}
      />

      {/* Medication Details Dialog */}
      <MedicationDetailsDialog
        isOpen={isMedicationDetailsOpen}
        onClose={() => setIsMedicationDetailsOpen(false)}
        productName={selectedProduct?.name}
      />

      {/* Keyboard Shortcut Guide */}
      <KeyboardShortcutGuide
        isOpen={isShortcutGuideOpen}
        onClose={() => setIsShortcutGuideOpen(false)}
      />

      {/* Upsell Dialog */}
      <UpsellDialog
        isOpen={isUpsellDialogOpen}
        onClose={() => setIsUpsellDialogOpen(false)}
        onConfirm={handleUpsellConfirm}
        productName={selectedProduct?.name}
      />
    </>
  );
}