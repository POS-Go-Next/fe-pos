"use client";

import OrderSummary from "@/components/shared/order-summary";
import PaymentDialog from "@/components/shared/payment-dialog";
import PaymentSuccessDialog from "@/components/shared/payment-success-dialog";
import TransactionInfo from "@/components/shared/transaction-info";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/useLogout";
import { usePOSKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { StockData } from "@/types/stock";
import { ProductTableItem } from "@/types/stock";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductTableSection } from "./_components";

// ✅ Fix: Add proper interface definitions inside the component file
interface CustomerData {
  id: number;
  name: string;
  gender: string;
  age: string;
  phone: string;
  address: string;
  status: string;
}

interface DoctorData {
  id: number;
  fullname: string;
  phone: string;
  address: string;
  fee_consultation?: number;
  sip: string;
  email?: string;
}

export default function ChooseMenuPage() {
  const [isClient, setIsClient] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerData | null>();
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(true);

  const { logout, isLoading: isLogoutLoading } = useLogout();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (shouldFocusSearch) {
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
  }, [shouldFocusSearch]);

  const [products, setProducts] = useState<ProductTableItem[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleClearAllProducts = () => {
    setProducts([]);
    setNextId(1);
    setShouldFocusSearch(true);
  };

  usePOSKeyboardShortcuts(
    {
      clearAllProducts: handleClearAllProducts,
    },
    {
      enabled: true,
      debug: false,
    }
  );

  // ✅ Fix: Wrap localStorage access in client-side check
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
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
    if (isClient && typeof window !== "undefined") {
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
      (sum, product) => sum + (product.sc || 0),
      0
    );
    const discount = filledProducts.reduce(
      (sum, product) => sum + (product.discount || 0),
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
  }, [products, isClient]);

  const paymentProducts = useMemo(() => {
    return products
      .filter((p) => p.name && p.quantity > 0)
      .map((product) => ({
        name: product.name,
        quantity: product.quantity,
        price: product.price || 0,
      }));
  }, [products]);

  const totalAmount = isClient
    ? products.reduce((sum, product) => sum + (product.subtotal || 0), 0)
    : 0;

  const handleQuantityChange = (id: number, value: number) => {
    if (!isClient) return;

    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const newQuantity = value < 0 ? 0 : value;
          const newSubtotal = (product.price || 0) * newQuantity;
          return {
            ...product,
            quantity: newQuantity,
            subtotal: newSubtotal,
            total:
              newSubtotal +
              (product.sc || 0) +
              (product.misc || 0) -
              (product.discount || 0) -
              (product.promo || 0),
          };
        }
        return product;
      })
    );
  };

  const handleTypeChange = (id: number, newType: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, type: newType } : product
      )
    );
  };

  const handleRemoveProduct = (id: number) => {
    if (!isClient) return;
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleProductNameClick = (id: number) => {
    console.log(`Product name clicked for ID: ${id}`);
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

  const handleProductSelect = (
    selectedStockData: StockData,
    productId: number
  ) => {
    const existingProductIndex = products.findIndex(
      (product) => product.stockData?.kode_brg === selectedStockData.kode_brg
    );

    if (existingProductIndex !== -1) {
      setProducts((prevProducts) =>
        prevProducts.map((product, index) => {
          if (index === existingProductIndex) {
            const newQuantity = product.quantity + 1;
            const newSubtotal = (product.price || 0) * newQuantity;
            return {
              ...product,
              quantity: newQuantity,
              subtotal: newSubtotal,
              total:
                newSubtotal +
                (product.sc || 0) +
                (product.misc || 0) -
                (product.discount || 0) -
                (product.promo || 0),
            };
          }
          return product;
        })
      );
    } else {
      const newProduct = convertStockToProduct(selectedStockData);
      setProducts((prevProducts) => [...prevProducts, newProduct]);
      setNextId((prevId) => prevId + 1);
    }
    setShouldFocusSearch(true);
  };

  const handlePayNow = (
    customerData?: CustomerData,
    doctorData?: DoctorData
  ) => {
    if (customerData) setSelectedCustomer(customerData);
    if (doctorData) setSelectedDoctor(doctorData);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    setIsPaymentSuccessDialogOpen(true);
  };

  const handlePendingBill = () => {
    handleClearAllProducts();
  };

  // ✅ Fix: Show loading state during SSR
  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-1 overflow-hidden gap-6 p-5">
        <div className="w-4/5 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="flex items-center text-gray-800 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="mr-2" size={20} />
                <h1 className="text-lg font-semibold">POST Transaction</h1>
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
            onRemoveProduct={handleRemoveProduct}
            onProductNameClick={handleProductNameClick}
            onProductSelect={handleProductSelect}
            onTypeChange={handleTypeChange}
            className="mb-6"
          />
        </div>

        <div className="w-1/5">
          <div className="p-5 bg-white shadow-md overflow-auto w-full rounded-2xl">
            <TransactionInfo
              transactionId="S24073831357"
              counter="#Guest / 01"
              date="August 17, 2023, 09:52 AM"
              badgeNumber={84}
              useRealTimeData={true}
              className="mb-6"
            />

            <OrderSummary
              subtotal={totals.subtotal}
              misc={totals.misc}
              serviceCharge={totals.serviceCharge}
              discount={totals.discount}
              promo={totals.promo}
              products={paymentProducts}
              onPendingBill={handlePendingBill}
              onPayNow={handlePayNow}
            />
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        totalAmount={totalAmount}
        orderDetails={{
          customer: selectedCustomer?.name || "Select Customer",
          items: paymentProducts,
        }}
      />

      <PaymentSuccessDialog
        isOpen={isPaymentSuccessDialogOpen}
        onClose={() => setIsPaymentSuccessDialogOpen(false)}
        onPrintBills={() => console.log("Print Bills")}
      />
    </div>
  );
}
