"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Promo } from "@/components/shared/promo-table";
import { ProductTableItem } from "@/types/stock";
import type { StockData } from "@/types/stock";
import TransactionInfo from "@/components/shared/transaction-info";
import CustomerInfoWithDialog from "@/components/shared/customer-info-with-dialog";
import OrderSummary from "@/components/shared/order-summary";
import PaymentDialog from "@/components/shared/payment-dialog";
import PaymentSuccessDialog from "@/components/shared/payment-success-dialog";
import {
  ProductTableSection,
  TabNavigation,
  PromoSection,
  BestSellerSection,
  SuggestionsSection,
  CalculatorToggle,
} from "./_components";

export default function ChooseMenuPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] =
    useState(false);

  // Tab and calculator states
  const [activeTab, setActiveTab] = useState<
    "promo" | "bestseller" | "suggestions"
  >("promo");
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Products state - start with empty array, only search functionality
  const [products, setProducts] = useState<ProductTableItem[]>([]);
  const [nextId, setNextId] = useState(1);

  // Load data from localStorage on client side
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

  // Save to localStorage whenever products or nextId changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("pos-products", JSON.stringify(products));
      localStorage.setItem("pos-next-id", nextId.toString());
    }
  }, [products, nextId, isClient]);

  // Promos state
  const [promos] = useState<Promo[]>([
    {
      id: "PR001",
      name: "Blackmores Vitamin & Minerals",
      type: "Buy 1 Get 1 Free",
      startDate: "05/12/24",
      endDate: "05/12/25",
    },
    {
      id: "PR002",
      name: "Folaries asam folat 30 Capsul",
      type: "Discount 10%",
      startDate: "05/12/24",
      endDate: "05/12/25",
    },
    {
      id: "PR003",
      name: "Dinosweet Syrup 100ml Jeruk",
      type: "Discount 10%",
      startDate: "05/12/24",
      endDate: "05/12/25",
    },
    {
      id: "PR004",
      name: "Ibuprofen 400mg Tablets",
      type: "Discount 15%",
      startDate: "06/01/24",
      endDate: "06/30/25",
    },
    {
      id: "PR005",
      name: "Paracetamol 500mg Capsules",
      type: "Buy 2 Get 1 Free",
      startDate: "06/15/24",
      endDate: "07/15/25",
    },
    {
      id: "PR006",
      name: "Vitamin C 1000mg Tablets",
      type: "Discount 20%",
      startDate: "07/01/24",
      endDate: "08/01/25",
    },
    {
      id: "PR007",
      name: "Omega-3 Fish Oil Capsules",
      type: "Buy 1 Get 30% Off",
      startDate: "07/10/24",
      endDate: "08/10/25",
    },
    {
      id: "PR008",
      name: "Calcium + Vitamin D Tablets",
      type: "Discount 25%",
      startDate: "08/01/24",
      endDate: "09/01/25",
    },
    {
      id: "PR009",
      name: "Probiotic Daily Capsules",
      type: "Buy 2 Get 50% Off",
      startDate: "08/15/24",
      endDate: "09/15/25",
    },
  ]);

  // Transaction information
  const transactionInfo = {
    id: "S24073831357",
    counter: "#Bangga / 01",
    date: "August 17, 2023, 09:52 AM",
  };

  // Calculate total amount
  const totalAmount = isClient
    ? products.reduce((sum, product) => sum + product.subtotal, 0)
    : 0;

  // Handle product quantity change
  const handleQuantityChange = (id: number, value: number) => {
    if (!isClient) return;

    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const newQuantity = value < 0 ? 0 : value;
          const newSubtotal = product.price * newQuantity;
          return {
            ...product,
            quantity: newQuantity,
            subtotal: newSubtotal,
            total:
              newSubtotal +
              product.sc +
              product.misc -
              product.discount -
              (product.promo || 0),
          };
        }
        return product;
      })
    );
  };

  // Handle product removal
  const handleRemoveProduct = (id: number) => {
    if (!isClient) return;

    setProducts(products.filter((product) => product.id !== id));
  };

  // Clear all products (optional function)
  const clearAllProducts = () => {
    if (!isClient) return;

    setProducts([]);
    setNextId(1);
    localStorage.removeItem("pos-products");
    localStorage.removeItem("pos-next-id");
  };

  // Handle product name click (for existing products)
  const handleProductNameClick = (id: number) => {
    console.log(`Product name clicked for ID: ${id}`);
  };

  // Convert StockData to ProductTableItem
  const convertStockToProduct = (stockData: StockData): ProductTableItem => {
    return {
      id: nextId,
      name: stockData.nama_brg,
      type: stockData.id_kategori === "001" ? "R/" : "RC",
      price: stockData.hj_ecer,
      quantity: 1, // Default quantity
      subtotal: stockData.hj_ecer,
      discount: 0,
      sc: 0,
      misc: 0,
      promo: 0,
      promoPercent: 0,
      up: "N",
      noVoucher: 0,
      total: stockData.hj_ecer,
      stockData: stockData, // Store original stock data
    };
  };

  // Handle product selection from Select Product Dialog
  const handleProductSelect = (
    selectedStockData: StockData,
    productId: number
  ) => {
    // Check if product already exists in the list
    const existingProductIndex = products.findIndex(
      (product) => product.stockData?.kode_brg === selectedStockData.kode_brg
    );

    if (existingProductIndex !== -1) {
      // Product already exists, increment quantity
      setProducts((prevProducts) =>
        prevProducts.map((product, index) => {
          if (index === existingProductIndex) {
            const newQuantity = product.quantity + 1;
            const newSubtotal = product.price * newQuantity;
            return {
              ...product,
              quantity: newQuantity,
              subtotal: newSubtotal,
              total:
                newSubtotal +
                product.sc +
                product.misc -
                product.discount -
                (product.promo || 0),
            };
          }
          return product;
        })
      );
    } else {
      // Product doesn't exist, create new row
      const newProduct = convertStockToProduct(selectedStockData);
      setProducts((prevProducts) => [...prevProducts, newProduct]);
      setNextId((prevId) => prevId + 1);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customerName: string) => {
    setSelectedCustomer(customerName);
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctorName: string) => {
    setSelectedDoctor(doctorName);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "promo":
        return <PromoSection promos={promos} />;
      case "bestseller":
        return <BestSellerSection />;
      case "suggestions":
        return <SuggestionsSection />;
      default:
        return <PromoSection promos={promos} />;
    }
  };

  if (!isClient) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column */}
        <div className="w-3/4 p-4 overflow-auto">
          {/* Header - Only in left column */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-800"
              >
                <ArrowLeft className="mr-2" size={20} />
                <h1 className="text-lg font-semibold">Choose Product</h1>
              </Link>
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

          {/* Product Table Section */}
          <ProductTableSection
            products={products}
            onQuantityChange={handleQuantityChange}
            onRemoveProduct={handleRemoveProduct}
            onProductNameClick={handleProductNameClick}
            onProductSelect={handleProductSelect}
            className="mb-6"
          />

          {/* Bottom section with Tab and Optional Calculator */}
          <div className="relative overflow-hidden">
            {/* Main Content Area with Tabs */}
            <div
              className={`transition-all duration-500 ease-in-out bg-white p-5 rounded-2xl ${
                isCalculatorVisible ? "w-[calc(100%-296px)]" : "w-full"
              }`}
            >
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-4">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

                <CalculatorToggle
                  isVisible={isCalculatorVisible}
                  onToggle={() => setIsCalculatorVisible(!isCalculatorVisible)}
                />
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl overflow-hidden">
                {renderTabContent()}
              </div>
            </div>

            {/* Calculator - Fixed Position (rendered by CalculatorToggle) */}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/4 p-4 bg-white shadow-md overflow-auto">
          {/* Transaction Information */}
          <TransactionInfo
            transactionId={transactionInfo.id}
            counter={transactionInfo.counter}
            date={transactionInfo.date}
            badgeNumber={84}
            className="mb-6"
          />

          {/* Customer Information with Dialog */}
          <CustomerInfoWithDialog
            selectedCustomer={selectedCustomer}
            selectedDoctor={selectedDoctor}
            onSelectCustomer={handleCustomerSelect}
            onSelectDoctor={handleDoctorSelect}
            className="mb-6"
            useDialog={true}
          />

          {/* Order Summary */}
          <OrderSummary
            subtotal={totalAmount}
            onPendingBill={() => console.log("Pending bill")}
            onPayNow={() => setIsPaymentDialogOpen(true)}
          />
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onPaymentSuccess={() => {
          setIsPaymentDialogOpen(false);
          setIsPaymentSuccessDialogOpen(true);
        }}
        totalAmount={totalAmount}
        orderDetails={{
          customer: selectedCustomer || "Select Customer",
          items: products
            .filter((p) => p.quantity > 0)
            .map((p) => ({
              name: p.name,
              quantity: p.quantity,
              price: p.price,
            })),
        }}
      />

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        isOpen={isPaymentSuccessDialogOpen}
        onClose={() => setIsPaymentSuccessDialogOpen(false)}
        onPrintBills={() => {
          console.log("Print Bills");
        }}
      />
    </div>
  );
}
