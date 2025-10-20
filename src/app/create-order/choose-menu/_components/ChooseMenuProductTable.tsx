"use client";

import BranchWideStockDialog from "@/components/shared/branch-wide-stock-dialog";
import MedicationDetailsDialog from "@/components/shared/medication-details-dialog";
import ProductTypeSelector from "@/components/shared/ProductTypeSelector";
import SelectProductDialog from "@/components/shared/select-product-dialog";
import ProductHistoryDialog from "@/components/shared/product-history-dialog";
import { Input } from "@/components/ui/input";
import { usePOSKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useParameter } from "@/hooks/useParameter";
import type { ProductTableItem, StockData } from "@/types/stock";
import type { TransactionCorrectionWithReturnType } from "./TransactionCorrectionDialog";
import { Plus, Trash, Undo } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import KeyboardShortcutGuide from "./KeyboardShortcutGuide";
import UpsellDialog from "./UpsellDialog";
import PrescriptionDiscountDialog from "./PrescriptionDiscountDialog";
import ChooseMiscDialog from "./ChooseMiscDialog";
import CorporateDiscountDialog from "./CorporateDiscountDialog";
import TransactionHistoryDialog from "./TransactionHistoryDialog";
import GlobalDiscountDialog from "./GlobalDiscountDialog";
import MonthlyPromoDialog from "./MonthlyPromoDialog";
import TransactionCorrectionDialog from "./TransactionCorrectionDialog";
import AddPendingBillDialog from "./AddPendingBillDialog";
import ViewPendingBillDialog from "./ViewPendingBillDialog";

const SEARCH_ROW_ID = 999;

const dialogStateTemplate = {
  selectProduct: false,
  branchStock: false,
  medicationDetails: false,
  shortcutGuide: false,
  upsell: false,
  prescriptionDiscount: false,
  chooseMisc: false,
  corporateDiscount: false,
  transactionHistory: false,
  globalDiscount: false,
  productHistory: false,
  monthlyPromo: false,
  transactionCorrection: false,
  addPendingBill: false,
  viewPendingBill: false,
} as const;

type DialogKey = keyof typeof dialogStateTemplate;

const createDialogState = () => ({ ...dialogStateTemplate });

const formatCurrency = (amount?: number | null) => {
  const numericAmount = Number(amount ?? 0);

  if (!Number.isFinite(numericAmount)) {
    return "Rp 0";
  }

  return `Rp ${numericAmount.toLocaleString("id-ID")}`;
};

const ProductActionIcons = ({
  onBranchStockClick,
  onMedicationDetailsClick,
  onDeleteClick,
  onUndeleteClick,
  product,
  showIcons = true,
}: {
  onBranchStockClick: () => void;
  onMedicationDetailsClick: () => void;
  onDeleteClick: () => void;
  onUndeleteClick?: () => void;
  product: ProductTableItem;
  showIcons?: boolean;
}) => {
  if (!showIcons) return null;

  const isDeletedOriginalItem = product.isOriginalReturnItem && product.isDeleted;

  return (
    <div className="flex items-center gap-2">
      {isDeletedOriginalItem ? (
        <button
          className="flex h-8 w-8 items-center justify-center rounded bg-green-100 transition-colors hover:bg-green-200"
          onClick={onUndeleteClick}
          title="Restore Product"
          type="button"
        >
          <Undo className="h-4 w-4 text-green-600" />
        </button>
      ) : (
        <button
          className="flex h-8 w-8 items-center justify-center rounded bg-red-100 transition-colors hover:bg-red-200"
          onClick={onDeleteClick}
          title="Delete Product"
          type="button"
        >
          <Trash className="h-4 w-4 text-red-600" />
        </button>
      )}

      <button
        className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 transition-colors hover:bg-blue-200"
        onClick={onBranchStockClick}
        title="View Branch Wide Stock"
        type="button"
      >
        <svg
          className="h-5 w-5 text-blue-600"
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

      <button
        className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 transition-colors hover:bg-blue-200"
        onClick={onMedicationDetailsClick}
        title="View Medication Details"
        type="button"
      >
        <svg
          className="h-5 w-5 text-blue-600"
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
  onQuantityBlur?: () => void;
  onQuantityKeyPress?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  onRemoveProduct: (id: number) => void;
  onUndeleteProduct?: (id: number) => void;
  onProductNameClick?: (id: number) => void;
  onProductSelect?: (product: StockData) => void;
  onTypeChange?: (id: number, type: string) => void;
  onDiscountChange?: (id: number, discount: number) => void;
  onMiscChange?: (id: number, miscAmount: number) => void;
  onUpsellingChange?: (id: number) => void;
  onTransactionReturn?: (transactionData: TransactionCorrectionWithReturnType, returnType: "item-based" | "full-return") => void;
  className?: string;
}

export default function ChooseMenuProductTable({
  products,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyPress,
  onRemoveProduct,
  onUndeleteProduct,
  onProductNameClick,
  onProductSelect,
  onTypeChange,
  onDiscountChange,
  onMiscChange,
  onUpsellingChange,
  onTransactionReturn,
  className = "",
}: ChooseMenuProductTableProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [dialogStates, setDialogStates] = useState(createDialogState);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductTableItem | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [preSearchQuery, setPreSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { parameterData } = useParameter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || !searchInputRef.current) return;

    const timeoutId = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted || !tableContainerRef.current || products.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop =
          tableContainerRef.current.scrollHeight;
      }
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [products.length, hasMounted]);

  useEffect(() => {
    if (!searchTimeout) return undefined;
    return () => window.clearTimeout(searchTimeout);
  }, [searchTimeout]);

  useEffect(() => {
    if (selectedRowId === null) {
      setSelectedProduct(null);
      return;
    }

    const nextSelectedProduct =
      products.find((product) => product.id === selectedRowId) ?? null;

    if (nextSelectedProduct) {
      setSelectedProduct(nextSelectedProduct);
      return;
    }

    setSelectedRowId(null);
    setSelectedProduct(null);
  }, [products, selectedRowId]);

  const setDialogVisibility = (dialogName: DialogKey, isOpen: boolean) => {
    setDialogStates((previous) => ({
      ...previous,
      [dialogName]: isOpen,
    }));
  };

  const openDialog = (dialogName: DialogKey) => {
    setDialogVisibility(dialogName, true);
  };

  const closeDialog = (dialogName: DialogKey) => {
    setDialogVisibility(dialogName, false);
  };

  const resetSearchState = () => {
    setSearchValue("");
    setPreSearchQuery("");
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  const getSCValueByType = (type: string): number => {
    if (!parameterData) return 0;

    switch (type) {
      case "R/":
        return parameterData.service || 0;
      case "RC":
        return parameterData.service_dokter || 0;
      default:
        return 0;
    }
  };

  const currentCartTotals = useMemo(() => {
    const filledProducts = products.filter(
      (product) => product.name && product.quantity > 0
    );

    const subtotal = filledProducts.reduce(
      (sum, product) => sum + (product.subtotal || 0),
      0
    );

    return {
      products: filledProducts,
      totalAmount: subtotal,
    };
  }, [products]);

  usePOSKeyboardShortcuts(
    {
      showShortcutGuide: () => openDialog("shortcutGuide"),
      showProductHistory: () => {
        if (selectedProduct) {
          openDialog("productHistory");
        }
      },
      showPrescriptionDiscount: () => {
        if (selectedProduct) {
          openDialog("prescriptionDiscount");
        }
      },
      showGlobalDiscount: () => openDialog("globalDiscount"),
      showPromoList: () => openDialog("monthlyPromo"),
      showUpSelling: () => {
        if (selectedProduct) {
          openDialog("upsell");
        }
      },
      showTransactionList: () => {
        if (selectedProduct) {
          openDialog("transactionHistory");
        }
      },
      showTransactionCorrection: () => openDialog("transactionCorrection"),
      addPendingBill: () => openDialog("addPendingBill"),
      viewPendingBill: () => openDialog("viewPendingBill"),
      showMemberCorporate: () => openDialog("corporateDiscount"),
      addMisc: () => {
        if (selectedProduct) {
          openDialog("chooseMisc");
        }
      },
    },
    {},
    { enabled: hasMounted, debug: false }
  );

  const handleProductSelectFromDialog = (stockItem: StockData) => {
    onProductSelect?.(stockItem);
    closeDialog("selectProduct");
    resetSearchState();
  };

  const handleRowClick = (product: ProductTableItem) => {
    if (product.id === SEARCH_ROW_ID) return;

    setSelectedRowId((previous) =>
      previous === product.id ? null : product.id
    );
  };

  const handleBranchStockClick = (product: ProductTableItem) => {
    console.log('🔍 handleBranchStockClick - product:', product);
    console.log('🔍 handleBranchStockClick - stockData:', product.stockData);
    console.log('🔍 handleBranchStockClick - kode_brg:', product.stockData?.kode_brg);
    setSelectedRowId(product.id);
    setSelectedProduct(product);
    openDialog("branchStock");
  };

  const handleMedicationDetailsClick = (product: ProductTableItem) => {
    console.log('🔍 handleMedicationDetailsClick - product:', product);
    console.log('🔍 handleMedicationDetailsClick - stockData:', product.stockData);
    console.log('🔍 handleMedicationDetailsClick - kode_brg:', product.stockData?.kode_brg);
    setSelectedRowId(product.id);
    setSelectedProduct(product);
    openDialog("medicationDetails");
  };

  const handleTypeChange = (productId: number, newType: string) => {
    if (productId === SEARCH_ROW_ID) return;
    onTypeChange?.(productId, newType);
  };

  const handleQuantityChange = (id: number, value: number) => {
    onQuantityChange(id, value);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const trimmedValue = value.trim();

    setSearchValue(value);

    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
    }

    if (trimmedValue.length < 3) {
      setSearchTimeout(null);
      setPreSearchQuery("");
      return;
    }

    const timeoutId = setTimeout(() => {
      setPreSearchQuery(trimmedValue);
      closeDialog("selectProduct");
      setTimeout(() => openDialog("selectProduct"), 0);
    }, 500);

    setSearchTimeout(timeoutId);
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;

    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    resetSearchState();
  };

  const handleOpenSelectProductDialog = () => {
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    setPreSearchQuery(searchValue.trim());
    closeDialog("selectProduct");
    window.setTimeout(() => openDialog("selectProduct"), 0);
  };

  const handlePendingBillSubmit = (pendingBillData: unknown) => {
    void pendingBillData;
    closeDialog("addPendingBill");
  };

  const handleLoadPendingBill = (bill: unknown) => {
    void bill;
    closeDialog("viewPendingBill");
  };

  const handleDeletePendingBill = (billId: string) => {
    void billId;
    closeDialog("viewPendingBill");
  };

  const tableData = useMemo<ProductTableItem[]>(() => {
    const searchRow: ProductTableItem = {
      id: SEARCH_ROW_ID,
      name: "",
      type: "",
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

    const filledProducts = products.filter((product) => product.name);
    return [searchRow, ...filledProducts];
  }, [products]);

  if (!hasMounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className={`mb-6 rounded-2xl bg-white p-5 ${className}`}>
        <div className="rounded-2xl bg-white">
          <div
            ref={tableContainerRef}
            className="custom-scrollbar max-h-[610px] overflow-auto"
          >
            <table className="w-full min-w-[1350px]">
              <thead className="sticky top-0 z-10 h-[60px]">
                <tr className="bg-gray-100">
                  <th className="w-[50px] rounded-tl-2xl px-3 text-left text-sm font-semibold text-black" />
                  <th className="w-[400px] px-3 text-left text-sm font-semibold text-black">
                    Product Name
                  </th>
                  <th className="w-[70px] px-3 text-left text-sm font-semibold text-black">
                    Type
                  </th>
                  <th className="w-[100px] px-3 text-left text-sm font-semibold text-black">
                    Price
                  </th>
                  <th className="w-[60px] px-3 text-center text-sm font-semibold text-black">
                    Qty
                  </th>
                  <th className="w-[100px] px-3 text-left text-sm font-semibold text-black">
                    SubTotal
                  </th>
                  <th className="w-[70px] px-3 text-center text-sm font-semibold text-black">
                    Disc%
                  </th>
                  <th className="w-[80px] px-3 text-left text-sm font-semibold text-black">
                    SC
                  </th>
                  <th className="w-[80px] px-3 text-left text-sm font-semibold text-black">
                    Misc
                  </th>
                  <th className="w-[80px] px-3 text-left text-sm font-semibold text-black">
                    Promo
                  </th>
                  <th className="w-[70px] px-3 text-center text-sm font-semibold text-black">
                    Promo%
                  </th>
                  <th className="w-[50px] px-3 text-center text-sm font-semibold text-black">
                    Up
                  </th>
                  <th className="w-[80px] px-3 text-center text-sm font-semibold text-black">
                    NoVoucher
                  </th>
                  <th className="w-[100px] rounded-tr-2xl px-3 text-left text-sm font-semibold text-black">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((product, index) => {
                  const hasProductData = Boolean(product.name);
                  const isSearchRow = product.id === SEARCH_ROW_ID;
                  const displaySCValue = hasProductData
                    ? getSCValueByType(product.type || "")
                    : 0;

                  const isDeletedOriginalItem = product.isOriginalReturnItem && product.isDeleted;
                  
                  const rowBackground =
                    isDeletedOriginalItem
                      ? "bg-red-100/60"
                      : isSearchRow && index === 0
                      ? "bg-blue-50 sticky top-14 z-5"
                      : index % 2 === 0
                      ? "bg-gray-50/30"
                      : "";

                  const rowHoverClass = isDeletedOriginalItem
                    ? "hover:bg-red-100"
                    : "hover:bg-blue-50";

                  return (
                    <tr
                      key={product.id}
                      className={`cursor-pointer border-b border-gray-100 ${rowHoverClass} ${rowBackground} ${
                        selectedRowId === product.id ? "bg-blue-50" : ""
                      } ${isDeletedOriginalItem ? "line-through text-red-600/70" : ""}`}
                      onClick={() => handleRowClick(product)}
                    >
                      <td className="p-3">
                        {hasProductData ? (
                          <input
                            type="checkbox"
                            checked={selectedRowId === product.id}
                            onChange={() => handleRowClick(product)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {hasProductData ? (
                            <>
                              <ProductActionIcons
                                onBranchStockClick={() =>
                                  handleBranchStockClick(product)
                                }
                                onMedicationDetailsClick={() =>
                                  handleMedicationDetailsClick(product)
                                }
                                onDeleteClick={() =>
                                  onRemoveProduct(product.id)
                                }
                                onUndeleteClick={() =>
                                  onUndeleteProduct?.(product.id)
                                }
                                product={product}
                              />
                              <span
                                className="max-w-[180px] truncate text-sm font-medium hover:text-blue-600"
                                onClick={() => onProductNameClick?.(product.id)}
                                title={product.name}
                              >
                                {product.name}
                              </span>
                            </>
                          ) : (
                            <div className="flex w-full items-center gap-3">
                              <button
                                className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 transition-colors hover:bg-blue-200"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenSelectProductDialog();
                                }}
                                title="Add Product"
                                type="button"
                              >
                                <Plus className="h-5 w-5 text-blue-600" />
                              </button>
                              <Input
                                ref={searchInputRef}
                                placeholder="Cari nama produk disini"
                                className="h-11 flex-1 border-[#F0F0F0] bg-white text-sm shadow-none"
                                value={searchValue}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleSearchKeyDown}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <ProductTypeSelector
                          type={product.type || ""}
                          onChange={(newType) =>
                            handleTypeChange(product.id, newType)
                          }
                          disabled={isSearchRow || !hasProductData}
                        />
                      </td>
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.price)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <Input
                            type="number"
                            value={hasProductData ? product.quantity : ""}
                            onChange={(event) =>
                              handleQuantityChange(
                                product.id,
                                parseInt(event.target.value, 10) || 0
                              )
                            }
                            onBlur={() => onQuantityBlur?.()}
                            onKeyDown={(event) =>
                              onQuantityKeyPress?.(event)
                            }
                            className="h-11 w-[76px] border-[#F0F0F0] text-center text-sm"
                            min="0"
                            data-product-id={product.id}
                            disabled={!hasProductData}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-sm font-semibold">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.subtotal)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <span className="w-[76px] py-2 text-center text-sm">
                            {product.discount || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(displaySCValue)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.misc)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="whitespace-nowrap">
                          {formatCurrency(product.promo || 0)}
                        </div>
                      </td>
                      <td className="p-3 text-center text-sm">
                        {product.promoPercent || 0}%
                      </td>
                      <td className="p-3 text-center text-sm">
                        {product.up || "N"}
                      </td>
                      <td className="p-3 text-center text-sm">
                        {product.noVoucher || 0}
                      </td>
                      <td className="p-3 text-sm font-bold">
                        <div className="whitespace-nowrap">
                          {formatCurrency(
                            hasProductData && product.subtotal
                              ? product.subtotal +
                                  displaySCValue +
                                  (product.misc || 0) -
                                  ((product.subtotal || 0) *
                                    (product.discount || 0)) /
                                    100 -
                                  (product.promo || 0)
                              : 0
                          )}
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

      <SelectProductDialog
        isOpen={dialogStates.selectProduct}
        onClose={() => {
          closeDialog("selectProduct");
          resetSearchState();
        }}
        onSelectProduct={handleProductSelectFromDialog}
        initialSearchQuery={preSearchQuery}
        autoSearch={preSearchQuery.length >= 3}
      />

      <BranchWideStockDialog
        isOpen={dialogStates.branchStock}
        onClose={() => closeDialog("branchStock")}
        productName={selectedProduct?.name}
        productCode={selectedProduct?.stockData?.kode_brg}
        retailPrice={formatCurrency(selectedProduct?.price)}
        wholesalePrice={formatCurrency(selectedProduct?.price)}
        quantity={selectedProduct?.quantity || 0}
        expiredDate="29/05/2030"
        units={selectedProduct?.stockData?.isi || 1}
        strips={selectedProduct?.stockData?.strip || 1}
        qtyFree={1}
      />

      <MedicationDetailsDialog
        isOpen={dialogStates.medicationDetails}
        onClose={() => closeDialog("medicationDetails")}
        productName={selectedProduct?.name}
        productCode={selectedProduct?.stockData?.kode_brg}
      />

      <ProductHistoryDialog
        isOpen={dialogStates.productHistory}
        onClose={() => closeDialog("productHistory")}
        productName={selectedProduct?.name}
        productCode={selectedProduct?.stockData?.kode_brg}
      />

      <KeyboardShortcutGuide
        isOpen={dialogStates.shortcutGuide}
        onClose={() => closeDialog("shortcutGuide")}
      />

      <UpsellDialog
        isOpen={dialogStates.upsell}
        onClose={() => closeDialog("upsell")}
        onConfirm={() => {
          if (selectedRowId !== null && onUpsellingChange) {
            onUpsellingChange(selectedRowId);
          }
          closeDialog("upsell");
        }}
        productName={selectedProduct?.name}
      />

      <PrescriptionDiscountDialog
        isOpen={dialogStates.prescriptionDiscount}
        onClose={() => closeDialog("prescriptionDiscount")}
        onSubmit={(productId, discount) => {
          onDiscountChange?.(productId, discount);
          closeDialog("prescriptionDiscount");
        }}
        selectedProduct={{
          id: selectedProduct?.id || 0,
          kode_brg: selectedProduct?.stockData?.kode_brg || "",
          nama_brg: selectedProduct?.name || "",
        }}
      />

      <ChooseMiscDialog
        isOpen={dialogStates.chooseMisc}
        onClose={() => closeDialog("chooseMisc")}
        onSubmit={(miscData) => {
          if (selectedRowId !== null) {
            onMiscChange?.(selectedRowId, miscData.amount);
          }
          closeDialog("chooseMisc");
        }}
      />

      <CorporateDiscountDialog
        isOpen={dialogStates.corporateDiscount}
        onClose={() => closeDialog("corporateDiscount")}
        onSubmit={(selectedCorporates) => {
          void selectedCorporates;
          closeDialog("corporateDiscount");
        }}
      />

      <TransactionHistoryDialog
        isOpen={dialogStates.transactionHistory}
        onClose={() => closeDialog("transactionHistory")}
        productName={selectedProduct?.name}
        productCode={selectedProduct?.stockData?.kode_brg}
      />

      <TransactionCorrectionDialog
        isOpen={dialogStates.transactionCorrection}
        onClose={() => closeDialog("transactionCorrection")}
        onSelectTransaction={(transaction) => {
          if (onTransactionReturn) {
            onTransactionReturn(transaction, transaction.returnType);
          }
          closeDialog("transactionCorrection");
        }}
      />

      <GlobalDiscountDialog
        isOpen={dialogStates.globalDiscount}
        onClose={() => closeDialog("globalDiscount")}
        onSubmit={(globalDiscountData) => {
          void globalDiscountData;
          closeDialog("globalDiscount");
        }}
      />

      <MonthlyPromoDialog
        isOpen={dialogStates.monthlyPromo}
        onClose={() => closeDialog("monthlyPromo")}
      />

      <AddPendingBillDialog
        isOpen={dialogStates.addPendingBill}
        onClose={() => closeDialog("addPendingBill")}
        onSubmit={handlePendingBillSubmit}
        currentProducts={currentCartTotals.products}
        currentTotal={currentCartTotals.totalAmount}
      />

      <ViewPendingBillDialog
        isOpen={dialogStates.viewPendingBill}
        onClose={() => closeDialog("viewPendingBill")}
        onLoadBill={handleLoadPendingBill}
        onDeleteBill={handleDeletePendingBill}
      />

      <style jsx>{`
        .custom-scrollbar {
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

        kbd {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 2px #ffffff;
          color: #374151;
          display: inline-block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          padding: 2px 4px;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
