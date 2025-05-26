"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Calculator from "@/components/calculator";
import ProductTable, { Product } from "@/components/product-table";
import PromoTable, { Promo } from "@/components/promo-table";
import TransactionInfo from "@/components/transaction-info";
import CustomerInfoWithDialog from "@/components/customer-info-with-dialog";
import OrderSummary from "@/components/order-summary";
import PaymentDialog from "@/components/payment-dialog";
import PaymentSuccessDialog from "@/components/payment-success-dialog";

export default function ChooseMenuPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] =
    useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Products state
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Incalin 100mg Strip 6Tab",
      price: 12000,
      quantity: 19,
      discount: 0,
      sc: 0,
      misc: 0,
      subtotal: 228000,
    },
    {
      id: 2,
      name: "Kurukumes Syrup 60ml",
      price: 33250,
      quantity: 2,
      discount: 0,
      sc: 0,
      misc: 0,
      subtotal: 66500,
    },
    {
      id: 3,
      name: "Blackmores Multivitamin",
      price: 82500,
      quantity: 1,
      discount: 0,
      sc: 0,
      misc: 0,
      subtotal: 82500,
    },
    {
      id: 4,
      name: "",
      price: 0,
      quantity: 0,
      discount: 0,
      sc: 0,
      misc: 0,
      subtotal: 0,
    },
    {
      id: 5,
      name: "",
      price: 0,
      quantity: 0,
      discount: 0,
      sc: 0,
      misc: 0,
      subtotal: 0,
    },
    {
      id: 6,
      name: "",
      price: 0,
      quantity: 0,
      discount: 0,
      sc: 0,
      misc: 0,
      subtotal: 0,
    },
  ]);

  // Promos state

  const [promos, _setPromos] = useState<Promo[]>([
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
          return {
            ...product,
            quantity: newQuantity,
            subtotal: product.price * newQuantity,
          };
        }
        return product;
      })
    );
  };

  // Handle product removal
  const handleRemoveProduct = (id: number) => {
    if (!isClient) return;

    setProducts(
      products.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            quantity: 0,
            subtotal: 0,
          };
        }
        return product;
      })
    );
  };

  // Handle customer selection
  const handleCustomerSelect = (customerName: string) => {
    setSelectedCustomer(customerName);
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctorName: string) => {
    setSelectedDoctor(doctorName);
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
          <div className="flex items-center pb-4">
            <Link href="/dashboard" className="flex items-center text-gray-800">
              <ArrowLeft className="mr-2" size={20} />
              <h1 className="text-lg font-semibold">Choose Product</h1>
            </Link>
            <div className="flex-grow flex justify-end ml-4">
              <div className="relative w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Scan or Search Barcode"
                  className="pl-10 bg-[#FFFFFF] border-none py-5"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#202325]"
                  size={18}
                />
              </div>
            </div>
          </div>

          {/* Product Table */}
          <ProductTable
            products={products}
            onQuantityChange={handleQuantityChange}
            onRemoveProduct={handleRemoveProduct}
            className="mb-6"
          />

          {/* Bottom section with Promo Table and Calculator side by side */}
          <div className="flex space-x-4">
            {/* Promo Table */}
            <div className="flex-1">
              <PromoTable promos={promos} />
            </div>

            {/* Calculator */}
            <div className="w-[30%] p-4 bg-[#fff] rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Simple Calculator</h2>
              <Calculator />
            </div>
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
