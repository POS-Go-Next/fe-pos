"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductTableItem } from "@/types/stock";
import type { StockData } from "@/types/stock";
import TransactionInfo from "@/components/shared/transaction-info";
import OrderSummary from "@/components/shared/order-summary";
import PaymentDialog from "@/components/shared/payment-dialog";
import PaymentSuccessDialog from "@/components/shared/payment-success-dialog";
import { ProductTableSection } from "./_components";

export default function ChooseMenuPage() {
  const [isClient, setIsClient] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] =
    useState(false);

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

  // Transaction information
  const transactionInfo = {
    id: "S24073831357",
    counter: "#Bangga / 01",
    date: "August 17, 2023, 09:52 AM",
  };

  // Calculate total amount
  const totalAmount = isClient
    ? products.reduce((sum, product) => sum + (product.subtotal || 0), 0)
    : 0;

  // Handle product quantity change
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

  // Handle product removal
  const handleRemoveProduct = (id: number) => {
    if (!isClient) return;

    setProducts(products.filter((product) => product.id !== id));
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
      price: stockData.hj_ecer || 0,
      quantity: 1, // Default quantity
      subtotal: stockData.hj_ecer || 0,
      discount: 0,
      sc: 0,
      misc: 0,
      promo: 0,
      promoPercent: 0,
      up: "N",
      noVoucher: 0,
      total: stockData.hj_ecer || 0,
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
      // Product doesn't exist, create new row
      const newProduct = convertStockToProduct(selectedStockData);
      setProducts((prevProducts) => [...prevProducts, newProduct]);
      setNextId((prevId) => prevId + 1);
    }
  };

  if (!isClient) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Table Area */}
        <div className="w-3/4 p-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-800"
              >
                <ArrowLeft className="mr-2" size={20} />
                <h1 className="text-lg font-semibold">POST Transaction</h1>
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

          <ProductTableSection
            products={products}
            onQuantityChange={handleQuantityChange}
            onRemoveProduct={handleRemoveProduct}
            onProductNameClick={handleProductNameClick}
            onProductSelect={handleProductSelect}
            className="mb-6"
          />
        </div>

        {/* Right Side - Sidebar with scroll */}
        <div className="w-1/4 p-4 bg-white shadow-md overflow-auto">
          <TransactionInfo
            transactionId={transactionInfo.id}
            counter={transactionInfo.counter}
            date={transactionInfo.date}
            badgeNumber={84}
            className="mb-6"
          />

          <OrderSummary
            subtotal={totalAmount}
            onPendingBill={() => console.log("Pending bill")}
            onPayNow={() => setIsPaymentDialogOpen(true)}
          />
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onPaymentSuccess={() => {
          setIsPaymentDialogOpen(false);
          setIsPaymentSuccessDialogOpen(true);
        }}
        totalAmount={totalAmount}
        orderDetails={{
          customer: "Select Customer",
          items: products
            .filter((p) => p.quantity > 0)
            .map((p) => ({
              name: p.name,
              quantity: p.quantity,
              price: p.price || 0,
            })),
        }}
      />

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
