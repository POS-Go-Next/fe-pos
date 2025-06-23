"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductTable, { Product } from "@/components/shared/product-table";
import PromoTable, { Promo } from "@/components/shared/promo-table";
import Calculator from "@/components/shared/calculator";
import TransactionInfo from "@/components/shared/transaction-info";
import CustomerInfoWithDialog from "@/components/shared/customer-info-with-dialog";
import OrderSummary from "@/components/shared/order-summary";
import PaymentDialog from "@/components/shared/payment-dialog";
import PaymentSuccessDialog from "@/components/shared/payment-success-dialog";

export default function ChooseMenuPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] =
    useState(false);
  
  // ✅ BARU: States untuk tabs dan calculator toggle
  const [activeTab, setActiveTab] = useState<'promo' | 'bestseller' | 'suggestions'>('promo');
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);

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

  // ✅ BARU: Custom Promo Table untuk Full Width
  const PromoTableFull = () => (
    <div className="w-full h-full">
      {/* Search Section */}
      <div className="flex p-4 pb-2">
        <div className="relative flex-grow mr-2">
          <Input
            type="text"
            placeholder="Search here"
            className="pl-10 bg-[#F5F5F5] border-none"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
          Search
        </Button>
      </div>

      {/* Table Section dengan padding yang tepat */}
      {/* Promo Table Header */}
      <div className="grid grid-cols-12 py-3 px-4 text-sm font-medium text-gray-600 bg-[#F5F5F5] w-full mx-4 rounded-t-lg">
        <div className="col-span-2">Promo ID</div>
        <div className="col-span-3">Product Name</div>
        <div className="col-span-3">Promo Type</div>
        <div className="col-span-2">Start Date</div>
        <div className="col-span-2">End Date</div>
      </div>

      {/* Promo Table Body */}
      <div className="w-full mx-4">
        {promos.slice(0, 3).map((promo, index) => (
          <div
            key={promo.id}
            className={`grid grid-cols-12 py-3 px-4 items-center text-sm cursor-pointer hover:bg-blue-50 ${
              index % 2 === 1 ? "bg-gray-50/50" : ""
            } ${index === 2 ? "rounded-b-lg" : ""}`}
          >
            <div className="col-span-2">{promo.id}</div>
            <div className="col-span-3">{promo.name}</div>
            <div className="col-span-3">{promo.type}</div>
            <div className="col-span-2">{promo.startDate}</div>
            <div className="col-span-2">{promo.endDate}</div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center py-4 items-center w-full">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-500 text-white mr-1">1</button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1">2</button>
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1">3</button>
        <span className="mx-1">...</span>
        
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 ml-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
  const BestSellerTable = () => (
    <div className="p-4">
      <div className="flex mb-4">
        <div className="relative flex-grow mr-2">
          <Input
            type="text"
            placeholder="Search Product Name"
            className="pl-10 bg-[#F5F5F5] border-none"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
          Search
        </Button>
      </div>

      <div>
        {/* Best Seller Table Header */}
        <div className="grid grid-cols-6 p-3 text-sm font-medium text-gray-600 bg-[#F5F5F5] rounded-xl">
          <div>Product ID</div>
          <div>Product Name</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Sales</div>
        </div>

        {/* Best Seller Table Body */}
        <div>
          {[
            { id: "BS001", name: "Paracetamol 500mg", category: "Medicine", price: "Rp 5.000", stock: "150", sales: "1,250" },
            { id: "BS002", name: "Vitamin C 1000mg", category: "Supplement", price: "Rp 15.000", stock: "89", sales: "890" },
            { id: "BS003", name: "Betadine Solution", category: "Antiseptic", price: "Rp 25.000", stock: "45", sales: "456" },
          ].map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-6 p-3 items-center text-sm cursor-pointer hover:bg-blue-50 ${
                index % 2 === 1 ? "bg-gray-50/50" : ""
              }`}
            >
              <div>{item.id}</div>
              <div>{item.name}</div>
              <div>{item.category}</div>
              <div>{item.price}</div>
              <div>{item.stock}</div>
              <div className="font-semibold text-green-600">{item.sales}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ✅ BARU: Suggestions Table Component
  const SuggestionsTable = () => (
    <div className="p-4">
      <div className="flex mb-4">
        <div className="relative flex-grow mr-2">
          <Input
            type="text"
            placeholder="Search Product Name"
            className="pl-10 bg-[#F5F5F5] border-none"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
          Search
        </Button>
      </div>

      <div>
        {/* Suggestions Table Header */}
        <div className="grid grid-cols-5 p-3 text-sm font-medium text-gray-600 bg-[#F5F5F5] rounded-xl">
          <div>Product ID</div>
          <div>Product Name</div>
          <div>Suggestion Type</div>
          <div>Price</div>
          <div>Reason</div>
        </div>

        {/* Suggestions Table Body */}
        <div>
          {[
            { id: "SG001", name: "Ibuprofen 400mg", type: "Alternative", price: "Rp 8.000", reason: "Similar to current selection" },
            { id: "SG002", name: "Multivitamin Complex", type: "Complement", price: "Rp 35.000", reason: "Often bought together" },
            { id: "SG003", name: "Hand Sanitizer 60ml", type: "Related", price: "Rp 12.000", reason: "Health & hygiene" },
          ].map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-5 p-3 items-center text-sm cursor-pointer hover:bg-blue-50 ${
                index % 2 === 1 ? "bg-gray-50/50" : ""
              }`}
            >
              <div>{item.id}</div>
              <div>{item.name}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.type === 'Alternative' ? 'bg-blue-100 text-blue-800' :
                  item.type === 'Complement' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {item.type}
                </span>
              </div>
              <div>{item.price}</div>
              <div className="text-gray-500 text-xs">{item.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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

          {/* ✅ DIUBAH: Bottom section dengan Tab dan Optional Calculator */}
          <div className="relative overflow-hidden">
            {/* Main Content Area with Tabs */}
            <div className={`transition-all duration-500 ease-in-out ${
              isCalculatorVisible ? 'w-[calc(100%-296px)]' : 'w-full'
            }`}>
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('promo')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'promo'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Promo
                  </button>
                  <button
                    onClick={() => setActiveTab('bestseller')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'bestseller'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Best Seller
                  </button>
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'suggestions'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Suggestions
                  </button>
                </div>

                {/* Calculator Toggle Button */}
                <button
                  onClick={() => setIsCalculatorVisible(!isCalculatorVisible)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                    />
                  </svg>
                  {isCalculatorVisible ? 'Hide Calculator' : 'Show Calculator'}
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl overflow-hidden">
                {activeTab === 'promo' && <PromoTableFull />}
                {activeTab === 'bestseller' && <BestSellerTable />}
                {activeTab === 'suggestions' && <SuggestionsTable />}
              </div>
            </div>

            {/* Calculator - Fixed Position */}
            <div className={`absolute top-0 right-0 w-[280px] h-full transition-all duration-500 ease-in-out ${
              isCalculatorVisible 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform translate-x-full opacity-0 pointer-events-none'
            }`}>
              <div className="p-4 bg-[#fff] rounded-xl h-full">
                <h2 className="text-lg font-semibold mb-2">Simple Calculator</h2>
                <Calculator />
              </div>
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