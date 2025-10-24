"use client";

import OrderSummary from "@/components/shared/order-summary";
import TransactionInfo from "@/components/shared/transaction-info";
import { Input } from "@/components/ui/input";
import { usePOSKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRouter } from "next/navigation";
import { useParameter } from "@/hooks/useParameter";
import { showSuccessAlert, showErrorAlert, showLoadingAlert } from "@/lib/swal";
import { 
  RETURN_TRANSACTION_CONFIG,
  createInitialTransactionState,
  calculateTotals,
  loadTransactionFromStorage,
  saveTransactionToStorage,
  clearTransactionStorage,
  convertStockToProduct,
  convertTransactionItemToProduct,
} from "@/lib/transaction-utils";
import { processTransaction } from "@/lib/transaction-processor";
import Swal from "sweetalert2";
import type { StockData } from "@/types/stock";
import { ProductTableItem } from "@/types/stock";
import type { TransactionItem } from "@/types/transaction";
import { ArrowLeft, Search, Undo } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ProductTableSection } from "../choose-menu/_components";
import TransactionHistoryDialog from "../choose-menu/_components/TransactionHistoryDialog";
import TransactionCorrectionDialog from "../choose-menu/_components/TransactionCorrectionDialog";
import type { TransactionCorrectionWithReturnType } from "../choose-menu/_components/TransactionCorrectionDialog";
import StockWarningDialog from "@/components/shared/stock-warning-dialog";
import CalculatorModal from "@/components/shared/calculator-modal";

export default function ReturnTransactionPage() {
  const config = RETURN_TRANSACTION_CONFIG;
  const initialState = createInitialTransactionState(config);
  
  const [isClient, setIsClient] = useState(initialState.isClient);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(initialState.shouldFocusSearch);
  const [shouldFocusQuantity, setShouldFocusQuantity] = useState(initialState.shouldFocusQuantity);
  const [lastAddedProductId, setLastAddedProductId] = useState(initialState.lastAddedProductId);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(initialState.isTransactionHistoryOpen);
  const [isTransactionCorrectionOpen, setIsTransactionCorrectionOpen] = useState(initialState.isTransactionCorrectionOpen);
  const [stockWarningDialog, setStockWarningDialog] = useState(initialState.stockWarningDialog);
  const [calculatorModal, setCalculatorModal] = useState(initialState.calculatorModal);
  const [pendingAction, setPendingAction] = useState(initialState.pendingAction);
  const [quantityValidationTimeout, setQuantityValidationTimeout] = useState(initialState.quantityValidationTimeout);
  const [triggerPayNow, setTriggerPayNow] = useState(initialState.triggerPayNow);
  const [products, setProducts] = useState(initialState.products);
  const [nextId, setNextId] = useState(initialState.nextId);
  const [returnTransactionInfo, setReturnTransactionInfo] = useState(initialState.returnTransactionInfo);

  const payNowButtonRef = useRef<HTMLButtonElement>(null);
  const isClearingRef = useRef(false);

  const router = useRouter();
  const { parameterData } = useParameter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    return () => {
      if (quantityValidationTimeout) {
        clearTimeout(quantityValidationTimeout);
      }
    };
  }, [quantityValidationTimeout]);

  const getSCValueByType = useCallback(
    (type: string): number => {
      if (!parameterData) return 0;

      switch (type) {
        case "R/":
          return parameterData.service || 0;
        case "RC":
          return parameterData.service_dokter || 0;
        default:
          return 0;
      }
    },
    [parameterData]
  );

  const validateStock = (
    product: ProductTableItem,
    requestedQuantity: number
  ): boolean => {
    const stockData = product.stockData;
    if (!stockData) {
      return true;
    }

    const availableStock = stockData.q_akhir;
    if (availableStock == null) {
      return true;
    }

    if (availableStock <= 0) {
      setStockWarningDialog({
        isOpen: true,
        productName: product.name,
        warningType: "out-of-stock",
        availableStock: 0,
        requestedQuantity,
      });
      return false;
    }

    if (requestedQuantity > availableStock) {
      setStockWarningDialog({
        isOpen: true,
        productName: product.name,
        warningType: "insufficient-stock",
        availableStock,
        requestedQuantity,
      });
      return false;
    }

    return true;
  };

  const handleMiscChange = (productId: number, miscAmount: number) => {
    if (!isClient) return;

    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedProduct = {
            ...product,
            misc: (product.misc || 0) + miscAmount,
          };

          const dynamicSC = getSCValueByType(product.type || "");
          updatedProduct.total =
            (updatedProduct.subtotal || 0) +
            dynamicSC +
            updatedProduct.misc -
            (updatedProduct.subtotal || 0) *
              ((updatedProduct.discount || 0) / 100) -
            (updatedProduct.promo || 0);

          return updatedProduct;
        }
        return product;
      })
    );
  };

  const handleUpsellingChange = (productId: number) => {
    if (!isClient) return;

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              up: product.up === "Y" ? "N" : "Y",
            }
          : product
      )
    );
  };

  useEffect(() => {
    if (shouldFocusSearch && isClient) {
      const timer = setTimeout(() => {
        const productSearchInput = document.querySelector(
          'input[placeholder="Cari nama produk disini"]'
        ) as HTMLInputElement;
        if (productSearchInput) {
          productSearchInput.focus();
        }
        setShouldFocusSearch(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldFocusSearch, isClient]);

  useEffect(() => {
    if (shouldFocusQuantity && lastAddedProductId && isClient) {
      const timer = setTimeout(() => {
        const quantityInput = document.querySelector(
          `input[data-product-id="${lastAddedProductId}"]`
        ) as HTMLInputElement;

        if (quantityInput) {
          quantityInput.focus();
          quantityInput.select();
        } else {
          const allQuantityInputs = document.querySelectorAll(
            'input[type="number"][data-product-id]'
          );
          const lastQuantityInput = allQuantityInputs[
            allQuantityInputs.length - 1
          ] as HTMLInputElement;
          if (lastQuantityInput) {
            lastQuantityInput.focus();
            lastQuantityInput.select();
          }
        }
        setShouldFocusQuantity(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [shouldFocusQuantity, lastAddedProductId, isClient, products]);

  const handleClearAllProducts = () => {
    isClearingRef.current = true;

    setProducts([]);
    setNextId(1);
    setLastAddedProductId(null);
    setShouldFocusSearch(true);
    
    // Reset return transaction info when clearing products
    setReturnTransactionInfo({
      isReturnTransaction: true, // Keep as return transaction
    });

    if (typeof window !== "undefined") {
      clearTransactionStorage(config);
    }

    setTimeout(() => {
      isClearingRef.current = false;
    }, 150);
  };

  const handleOpenTransactionHistory = () => {
    setIsTransactionHistoryOpen(true);
  };

  const handleShowCustomerDoctorDialogViaShortcut = () => {
    if (products.length === 0 || !products.some((p) => p.name)) {
      alert("Please add products to cart before proceeding with payment");
      return;
    }

    setTriggerPayNow(true);
  };

  useEffect(() => {
    if (triggerPayNow && payNowButtonRef.current) {
      payNowButtonRef.current.click();
      setTriggerPayNow(false);
    }
  }, [triggerPayNow]);

  usePOSKeyboardShortcuts(
    {
      clearAllProducts: handleClearAllProducts,
      showTransactionCorrection: () => setIsTransactionCorrectionOpen(true),
    },
    {
      transactionHistory: handleOpenTransactionHistory,
      showCustomerDoctorDialog: handleShowCustomerDoctorDialogViaShortcut,
    },
    {
      enabled: isClient,
      debug: false,
    }
  );

  // Load return transaction data from local storage using shared utility
  useEffect(() => {
    if (isClient) {
      const { products: savedProducts, nextId: savedNextId } = loadTransactionFromStorage(config);
      setProducts(savedProducts);
      setNextId(savedNextId);
      
      // Load return transaction info from localStorage
      const savedReturnInfo = localStorage.getItem("return-transaction-info");
      if (savedReturnInfo) {
        try {
          const returnInfo = JSON.parse(savedReturnInfo);
          setReturnTransactionInfo(returnInfo);
        } catch (error) {
          console.error("Error parsing return transaction info:", error);
        }
      }
    }
  }, [isClient, config]);

  // Save return transaction data to local storage using shared utility
  useEffect(() => {
    if (isClient && !isClearingRef.current) {
      saveTransactionToStorage(config, products, nextId);
    }
  }, [products, nextId, isClient, config]);

  const handleBackNavigation = () => {
    router.push('/create-order/choose-menu');
  };

  // Calculate totals using shared utility
  const totals = useMemo(() => {
    return calculateTotals(products, getSCValueByType, isClient);
  }, [products, isClient, getSCValueByType]);

  const paymentProducts = useMemo(() => {
    return products
      .filter((p) => p.name && p.quantity > 0 && !(p.isOriginalReturnItem && p.isDeleted))
      .map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        price: product.price || 0,
        subtotal: product.subtotal || 0,
        discount: product.discount || 0,
        sc: getSCValueByType(product.type || ""),
        misc: product.misc || 0,
        promo: product.promo || 0,
        total: product.total || 0,
        stockData: product.stockData,
        up: product.up,
      }));
  }, [products, getSCValueByType]);

  const debouncedStockValidation = useCallback((productToValidate: ProductTableItem, newQuantity: number, productId: number) => {
    const isValidStock = validateStock(productToValidate, newQuantity);
    
    if (!isValidStock) {
      // Store pending action for confirmation
      setPendingAction({
        type: "quantity-change",
        data: { productId, newQuantity }
      });
    }
  }, []);

  const handleQuantityChange = (id: number, value: number) => {
    if (!isClient) return;

    const productToValidate = products.find((product) => product.id === id);
    if (!productToValidate) return;

    // Clear existing timeout
    if (quantityValidationTimeout) {
      clearTimeout(quantityValidationTimeout);
    }

    // Immediately update the UI
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id !== id) {
          return product;
        }

        const newQuantity = value < 0 ? 0 : value;
        const newSubtotal = (product.price || 0) * newQuantity;
        const dynamicSC = getSCValueByType(product.type || "");

        return {
          ...product,
          quantity: newQuantity,
          subtotal: newSubtotal,
          sc: dynamicSC,
          total:
            newSubtotal +
            dynamicSC +
            (product.misc || 0) -
            newSubtotal * ((product.discount || 0) / 100) -
            (product.promo || 0),
        };
      })
    );

    // Debounce the stock validation by 500ms
    const timeoutId = setTimeout(() => {
      debouncedStockValidation(productToValidate, value, id);
    }, 500);
    setQuantityValidationTimeout(timeoutId);
  };

  const handleQuantityBlur = () => {
    setTimeout(() => {
      setShouldFocusSearch(true);
    }, 100);
  };

  const handleQuantityKeyPress = (
    event: ReactKeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      (event.target as HTMLInputElement).blur();
      setShouldFocusSearch(true);
    } else if (event.ctrlKey && event.key === "/") {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      const target = event.target as HTMLInputElement;
      const productId = parseInt(target.getAttribute("data-product-id") || "0", 10);
      const currentValue = target.value;
      
      if (productId) {
        setCalculatorModal({
          isOpen: true,
          targetProductId: productId,
          currentValue: currentValue,
        });
      }
    }
  };

  const handleCalculatorClose = () => {
    setCalculatorModal({
      isOpen: false,
      targetProductId: null,
      currentValue: "",
    });
  };

  const handleCalculatorResult = (result: number) => {
    if (calculatorModal.targetProductId) {
      handleQuantityChange(calculatorModal.targetProductId, result);
    }
  };

  const handleTypeChange = (id: number, newType: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === id) {
          const newSCValue = getSCValueByType(newType);

          const updatedProduct = {
            ...product,
            type: newType,
            sc: newSCValue,
          };

          updatedProduct.total =
            (updatedProduct.subtotal || 0) +
            newSCValue +
            (updatedProduct.misc || 0) -
            (updatedProduct.subtotal || 0) *
              ((updatedProduct.discount || 0) / 100) -
            (updatedProduct.promo || 0);

          return updatedProduct;
        }
        return product;
      })
    );
  };

  const handleDiscountChange = (
    productId: number,
    discountPercentage: number
  ) => {
    if (!isClient) return;

    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const discountAmount =
            (product.subtotal || 0) * (discountPercentage / 100);
          const dynamicSC = getSCValueByType(product.type || "");
          const newTotal =
            (product.subtotal || 0) +
            dynamicSC +
            (product.misc || 0) -
            discountAmount -
            (product.promo || 0);

          return {
            ...product,
            discount: discountPercentage,
            sc: dynamicSC,
            total: Math.max(0, newTotal),
          };
        }
        return product;
      })
    );
  };

  const handleRemoveProduct = (id: number) => {
    if (!isClient) return;
    
    setProducts((prevProducts) => {
      const updatedProducts: ProductTableItem[] = [];
      
      for (const product of prevProducts) {
        if (product.id === id) {
          // If it's an original return item, mark as deleted instead of removing
          if (product.isOriginalReturnItem) {
            updatedProducts.push({
              ...product,
              isDeleted: true,
            });
          }
          // For non-original items, don't add to the array (effectively removing)
        } else {
          // Keep all other products
          updatedProducts.push(product);
        }
      }
      
      return updatedProducts;
    });
    
    setShouldFocusSearch(true);
  };

  const handleUndeleteProduct = (id: number) => {
    if (!isClient) return;
    
    setProducts((prevProducts) => 
      prevProducts.map((product) => 
        product.id === id && product.isOriginalReturnItem
          ? { ...product, isDeleted: false }
          : product
      )
    );
    
    setShouldFocusSearch(true);
  };

  const handleProductSelect = (selectedStockData: StockData) => {
    const availableStock = selectedStockData.q_akhir;

    if (availableStock != null && availableStock <= 0) {
      setStockWarningDialog({
        isOpen: true,
        productName: selectedStockData.nama_brg,
        warningType: "out-of-stock",
        availableStock: 0,
        requestedQuantity: 1,
      });
      setPendingAction({
        type: "product-select",
        data: { stockData: selectedStockData }
      });
      return;
    }

    const newProduct = convertStockToProduct(selectedStockData, nextId);
    // Add return-specific properties
    newProduct.isOriginalReturnItem = false; // Mark as new item
    newProduct.isDeleted = false;
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setLastAddedProductId(nextId);
    setNextId((prevId) => prevId + 1);
    setShouldFocusQuantity(true);
  };

  const handleTransactionReturn = async (transactionData: TransactionCorrectionWithReturnType) => {
    if (transactionData.returnType === "item-based") {
      try {
        showLoadingAlert("Loading transaction details...", "Please wait while we load the transaction items for return.");

        const response = await fetch(
          `/api/transaction/invoice?invoice_number=${encodeURIComponent(transactionData.invoice_number.trim())}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.data && data.data.items) {
          setProducts([]);
          
          // Debug: Log the first item to see the data structure
          if (data.data.items.length > 0) {
            console.log("Transaction item sample:", data.data.items[0]);
          }
          
          const returnProducts: ProductTableItem[] = data.data.items.map((item: TransactionItem, index: number) => {
            const product = convertTransactionItemToProduct(item, index + 1);
            // Add return-specific properties
            product.isOriginalReturnItem = true; // Mark as original return item
            product.isDeleted = false; // Initially not deleted
            return product;
          });
          
          setProducts(returnProducts);
          setNextId(returnProducts.length + 1);
          
          setReturnTransactionInfo({
            customerName: data.data.customer_name || undefined,
            doctorName: data.data.doctor_name || undefined,
            isReturnTransaction: true,
            invoiceNumber: transactionData.invoice_number, // Store original invoice number
          });
          
          setIsTransactionCorrectionOpen(false);
          
          Swal.close();
          showSuccessAlert(
            "Return Items Loaded",
            `Transaction ${transactionData.invoice_number} items have been loaded for return processing. Customer: ${data.data.customer_name || 'N/A'}${data.data.doctor_name ? `, Doctor: ${data.data.doctor_name}` : ''}`
          );
        } else {
          throw new Error("No items found in transaction");
        }
      } catch (error) {
        console.error("Error loading transaction for return:", error);
        Swal.close();
        showErrorAlert(
          "Failed to Load Transaction",
          error instanceof Error ? error.message : "Failed to load transaction details for return processing."
        );
      }
    } else if (transactionData.returnType === "full-return") {
      try {
        // Show loading while fetching transaction details
        showLoadingAlert("Loading transaction details...", "Please wait while we load the transaction for full return.");

        // Fetch transaction details to get the items for full return
        const response = await fetch(
          `/api/transaction/invoice?invoice_number=${encodeURIComponent(transactionData.invoice_number.trim())}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.data && data.data.items) {
          // Convert transaction items to products for the processor
          const originalProducts: ProductTableItem[] = data.data.items.map((item: TransactionItem, index: number) => 
            convertTransactionItemToProduct(item, index + 1)
          );
          
          // Update loading message
          showLoadingAlert("Processing return...", "Please wait while we process the full transaction return.");
          
          const result = await processTransaction({
            type: "full-return",
            originalTransactionData: transactionData,
            originalProducts: originalProducts,
            returnReason: transactionData.returnReason || "Customer request",
          });

          if (!result.success) {
            throw new Error(result.message || "Failed to process return");
          }

          setIsTransactionCorrectionOpen(false);
          
          showSuccessAlert(
            "Return Processed", 
            `Transaction ${transactionData.invoice_number} has been successfully returned.`
          );
        } else {
          throw new Error("No items found in transaction");
        }
      } catch (error) {
        console.error("Error loading transaction for full return:", error);
        showErrorAlert(
          "Failed to Load Transaction",
          error instanceof Error ? error.message : "Failed to load transaction details for return processing."
        );
      }
    }
  };

  const handlePendingBill = () => {
    handleClearAllProducts();
  };

  const handlePaymentComplete = () => {
    handleClearAllProducts();
  };

  const handleStockWarningClose = () => {
    setStockWarningDialog((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setPendingAction(null);
  };

  const handleStockWarningConfirm = () => {
    if (pendingAction) {
      if (pendingAction.type === "quantity-change") {
        const { productId, newQuantity } = pendingAction.data;
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? { ...product, quantity: newQuantity }
              : product
          )
        );
      } else if (pendingAction.type === "product-select") {
        const { stockData } = pendingAction.data;
        const newProduct = convertStockToProduct(stockData, nextId);
        // Add return-specific properties
        newProduct.isOriginalReturnItem = false; // Mark as new item
        newProduct.isDeleted = false;
        setProducts((prevProducts) => [...prevProducts, newProduct]);
        setLastAddedProductId(nextId);
        setNextId((prevId) => prevId + 1);
      }
    }
    
    setStockWarningDialog((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setPendingAction(null);
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="flex flex-1 gap-6 p-5">
        <div className="w-4/5 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-5 mb-6">
            <div className="flex items-center">
              <button
                onClick={handleBackNavigation}
                className="flex items-center text-gray-800 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="mr-2" size={20} />
                <div className="flex items-center gap-2">
                  <Undo className="text-orange-600" size={20} />
                  <h1 className="text-lg font-semibold text-orange-800">Return Transaction</h1>
                </div>
              </button>
              <div className="flex-grow flex justify-end ml-4">
                <div className="relative w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Scan or Search Barcode"
                    className="pl-10 bg-[#F5F5F5] border-none py-5"
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#202325]"
                    size={18}
                  />
                </div>
              </div>
            </div>
          </div>

          <ProductTableSection
            products={products}
            onQuantityChange={handleQuantityChange}
            onQuantityBlur={handleQuantityBlur}
            onQuantityKeyPress={handleQuantityKeyPress}
            onRemoveProduct={handleRemoveProduct}
            onUndeleteProduct={handleUndeleteProduct}
            onProductSelect={handleProductSelect}
            onTypeChange={handleTypeChange}
            onDiscountChange={handleDiscountChange}
            onMiscChange={handleMiscChange}
            onUpsellingChange={handleUpsellingChange}
            onTransactionReturn={handleTransactionReturn}
            className="mb-6"
          />
        </div>

        <div className="w-1/5">
          <div className="p-5 bg-white shadow-md overflow-auto w-full rounded-2xl border border-orange-200">
            <TransactionInfo 
              useRealTimeData={true} 
              className="mb-6" 
              returnTransactionInfo={returnTransactionInfo}
            />

            <OrderSummary
              subtotal={totals.subtotal}
              misc={totals.misc}
              serviceCharge={totals.serviceCharge}
              discount={totals.discount}
              promo={totals.promo}
              products={paymentProducts}
              onPendingBill={handlePendingBill}
              onPaymentComplete={handlePaymentComplete}
              payNowButtonRef={payNowButtonRef}
              returnTransactionInfo={returnTransactionInfo}
            />
          </div>
        </div>
      </div>

      <TransactionHistoryDialog
        isOpen={isTransactionHistoryOpen}
        onClose={() => {
          setIsTransactionHistoryOpen(false);
        }}
      />

      <TransactionCorrectionDialog
        isOpen={isTransactionCorrectionOpen}
        onClose={() => {
          setIsTransactionCorrectionOpen(false);
        }}
        onSelectTransaction={handleTransactionReturn}
      />

      <StockWarningDialog
        isOpen={stockWarningDialog.isOpen}
        onClose={handleStockWarningClose}
        onConfirm={handleStockWarningConfirm}
        productName={stockWarningDialog.productName}
        warningType={stockWarningDialog.warningType}
        availableStock={stockWarningDialog.availableStock}
        requestedQuantity={stockWarningDialog.requestedQuantity}
      />

      <CalculatorModal
        isOpen={calculatorModal.isOpen}
        onClose={handleCalculatorClose}
        onCalculate={handleCalculatorResult}
        initialValue={calculatorModal.currentValue}
      />
    </div>
  );
}