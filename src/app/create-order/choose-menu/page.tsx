"use client";

import OrderSummary from "@/components/shared/order-summary";
import TransactionInfo from "@/components/shared/transaction-info";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/useLogout";
import { usePOSKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useParameter } from "@/hooks/useParameter";
import type { StockData } from "@/types/stock";
import { ProductTableItem } from "@/types/stock";
import { ArrowLeft, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ProductTableSection } from "./_components";
import TransactionHistoryDialog from "./_components/TransactionHistoryDialog";
import StockWarningDialog from "@/components/shared/stock-warning-dialog";

export default function ChooseMenuPage() {
  const [isClient, setIsClient] = useState(false);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(true);
  const [shouldFocusQuantity, setShouldFocusQuantity] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<number | null>(
    null
  );

  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] =
    useState(false);

  const [stockWarningDialog, setStockWarningDialog] = useState({
    isOpen: false,
    productName: "",
    warningType: "out-of-stock" as "out-of-stock" | "insufficient-stock",
    availableStock: 0,
    requestedQuantity: 0,
  });

  const [pendingAction, setPendingAction] = useState<{
    type: "quantity-change";
    data: { productId: number; newQuantity: number };
  } | {
    type: "product-select";
    data: { stockData: StockData };
  } | null>(null);

  const [quantityValidationTimeout, setQuantityValidationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [triggerPayNow, setTriggerPayNow] = useState(false);
  const payNowButtonRef = useRef<HTMLButtonElement>(null);
  const isClearingRef = useRef(false);

  const { logout, isLoading: isLogoutLoading } = useLogout();
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

  const [products, setProducts] = useState<ProductTableItem[]>([]);
  const [nextId, setNextId] = useState(1);

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

    if (typeof window !== "undefined") {
      localStorage.setItem("pos-products", "[]");
      localStorage.setItem("pos-next-id", "1");
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

  useEffect(() => {
    if (isClient) {
      const savedProducts = localStorage.getItem("pos-products");
      const savedNextId = localStorage.getItem("pos-next-id");

      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          setProducts(parsedProducts);
        } catch (error) {
          console.error("Error parsing saved products:", error);
        }
      }

      if (savedNextId) {
        try {
          setNextId(parseInt(savedNextId));
        } catch (error) {
          console.error("Error parsing saved next ID:", error);
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient && !isClearingRef.current) {
      localStorage.setItem("pos-products", JSON.stringify(products));
      localStorage.setItem("pos-next-id", nextId.toString());
    }
  }, [products, nextId, isClient]);

  const handleLogout = async () => {
    await logout();
  };

  const totals = useMemo(() => {
    if (!isClient)
      return {
        subtotal: 0,
        misc: 0,
        serviceCharge: 0,
        discount: 0,
        promo: 0,
      };

    const filledProducts = products.filter((p) => p.name && p.quantity > 0);

    const subtotal = filledProducts.reduce(
      (sum, product) => sum + (product.subtotal || 0),
      0
    );
    const misc = filledProducts.reduce(
      (sum, product) => sum + (product.misc || 0),
      0
    );
    const serviceCharge = filledProducts.reduce(
      (sum, product) => sum + getSCValueByType(product.type || ""),
      0
    );
    const discount = filledProducts.reduce(
      (sum, product) =>
        sum + (product.subtotal || 0) * ((product.discount || 0) / 100),
      0
    );
    const promo = filledProducts.reduce(
      (sum, product) => sum + (product.promo || 0),
      0
    );

    return {
      subtotal,
      misc,
      serviceCharge,
      discount,
      promo,
    };
  }, [products, isClient, getSCValueByType]);

  const paymentProducts = useMemo(() => {
    return products
      .filter((p) => p.name && p.quantity > 0)
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
    setProducts(products.filter((product) => product.id !== id));
    setShouldFocusSearch(true);
  };

  const convertStockToProduct = (stockData: StockData): ProductTableItem => {
    return {
      id: nextId,
      name: stockData.nama_brg,
      type: "",
      price: stockData.hj_ecer || 0,
      quantity: 1,
      subtotal: stockData.hj_ecer || 0,
      discount: 0,
      sc: 0,
      misc: 0,
      promo: 0,
      promoPercent: 0,
      up: "N",
      noVoucher: 0,
      total: stockData.hj_ecer || 0,
      stockData: stockData,
    };
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
      // Store pending action for confirmation
      setPendingAction({
        type: "product-select",
        data: { stockData: selectedStockData }
      });
      return;
    }

    const newProduct = convertStockToProduct(selectedStockData);
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setLastAddedProductId(nextId);
    setNextId((prevId) => prevId + 1);
    setShouldFocusQuantity(true);
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
        const newProduct = convertStockToProduct(stockData);
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-1 gap-6 p-5">
        <div className="w-4/5 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="flex items-center text-gray-800 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="mr-2" size={20} />
                <h1 className="text-lg font-semibold">POS Transaction</h1>
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
            onProductSelect={handleProductSelect}
            onTypeChange={handleTypeChange}
            onDiscountChange={handleDiscountChange}
            onMiscChange={handleMiscChange}
            onUpsellingChange={handleUpsellingChange}
            className="mb-6"
          />
        </div>

        <div className="w-1/5">
          <div className="p-5 bg-white shadow-md overflow-auto w-full rounded-2xl">
            <TransactionInfo useRealTimeData={true} className="mb-6" />

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

      <StockWarningDialog
        isOpen={stockWarningDialog.isOpen}
        onClose={handleStockWarningClose}
        onConfirm={handleStockWarningConfirm}
        productName={stockWarningDialog.productName}
        warningType={stockWarningDialog.warningType}
        availableStock={stockWarningDialog.availableStock}
        requestedQuantity={stockWarningDialog.requestedQuantity}
      />
    </div>
  );
}
