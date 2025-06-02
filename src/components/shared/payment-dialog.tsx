"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  totalAmount: number;
  orderDetails: {
    customer: string;
    items: { name: string; quantity: number; price: number }[];
  };
}

export default function PaymentDialog({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmount,
  orderDetails,
}: PaymentDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "credit" | "debit" | null
  >(null);

  if (!isOpen) return null;

  const renderPaymentMethodContent = () => {
    switch (selectedPaymentMethod) {
      case "cash":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-2">Amount</label>
              <Input placeholder="Enter amount" />
            </div>
          </div>
        );
      case "credit":
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">
                  Amount
                </label>
                <Input placeholder="Enter amount" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">Bank</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bca">BCA</SelectItem>
                    <SelectItem value="mandiri">Mandiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">
                Account Number
              </label>
              <Input placeholder="Enter account number" />
            </div>
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">
                  EDC Machine
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select EDC machine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edc1">EDC 1</SelectItem>
                    <SelectItem value="edc2">EDC 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">
                  Credit Card Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Enter/select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case "debit":
        return (
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">
                  Amount
                </label>
                <Input placeholder="Enter amount" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">Bank</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bca">BCA</SelectItem>
                    <SelectItem value="mandiri">Mandiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">
                Account Number
              </label>
              <Input placeholder="Enter account number" />
            </div>
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">
                  EDC Machine
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select EDC machine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edc1">EDC 1</SelectItem>
                    <SelectItem value="edc2">EDC 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-2">
                  Debit Card Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Enter/select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-[#F5F5F5] rounded-lg w-[1100px] max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex justify-between items-center p-6 border-b bg-[#F5F5F5] sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Payment</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          {/* Main content - Two-column layout */}
          <div className="grid grid-cols-2">
            {/* Left Column - Order Details */}
            <div className="p-6 border-r h-full overflow-y-auto">
              <div className="mb-4">
                <div className="text-base text-[#202325] mb-3 font-semibold">
                  Customer Information
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium mr-4">
                    84
                  </div>
                  <div>
                    <div className="text-base text-[#202325] mb-0 font-semibold">
                      {orderDetails.customer}
                    </div>
                    <div className="text-sm text-[#636566]">
                      84 / Offline Store
                    </div>
                  </div>
                  <div className="ml-auto text-sm text-[#636566] flex flex-col items-end">
                    <p>August 17, 2023</p>
                    <p>09:52 AM</p>
                  </div>
                </div>
              </div>

              <div className="my-4">
                <div className="bg-[#E8E8E8] rounded-2xl p-6 space-y-4">
                  <div className="text-base text-[#202325] mb-3 font-semibold">
                    Transaction Details
                  </div>
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <div className="text-base text-[#202325] mb-1 font-medium">
                          {item.name}
                        </div>
                        <div className="text-base text-[#202325] mb-3 font-semibold">
                          Rp {item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-sm text-[#202325] mb-1 font-semibold">
                        <div>{item.quantity}x</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-[#C6C7C8] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Sub Total
                      </span>
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Rp {totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Misc
                      </span>
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Rp 0
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        SC
                      </span>
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Rp 0
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Discount
                      </span>
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Rp 0
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Promo
                      </span>
                      <span className="text-base text-[#202325] mb-3 font-semibold">
                        Rp 0
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-[#C6C7C8] pt-5">
                      <span className="text-xl text-[#202325]">
                        Grand Total
                      </span>
                      <span className="text-xl text-[#202325]">
                        Rp {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Methods */}
            <div className="p-6 space-y-4 h-full overflow-y-auto">
              {/* Cash Payment */}
              <div
                className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer ${
                  selectedPaymentMethod === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => setSelectedPaymentMethod("cash")}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-md mr-3">
                    💵
                  </div>
                  <span>Cash</span>
                </div>
                <ChevronRight />
              </div>

              {/* Credit Card Payment */}
              <div
                className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer ${
                  selectedPaymentMethod === "credit"
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => setSelectedPaymentMethod("credit")}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-md mr-3">
                    💳
                  </div>
                  <span>Credit Card</span>
                </div>
                <ChevronRight />
              </div>

              {/* Debit Card Payment */}
              <div
                className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer ${
                  selectedPaymentMethod === "debit"
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => setSelectedPaymentMethod("debit")}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-md mr-3">
                    💳
                  </div>
                  <span>Debit Card</span>
                </div>
                <ChevronRight />
              </div>

              {/* Dynamic Payment Method Content */}
              {selectedPaymentMethod && (
                <div className="mt-4">{renderPaymentMethodContent()}</div>
              )}

              {/* Pay Now Button */}
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-6"
                disabled={!selectedPaymentMethod}
                onClick={() => {
                  // Tambahkan logika validasi pembayaran di sini jika diperlukan
                  onPaymentSuccess();
                }}
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
