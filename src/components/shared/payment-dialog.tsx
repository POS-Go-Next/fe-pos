// components/shared/payment-dialog.tsx - UPDATED TO KEEP TRANSACTION DETAILS LIST
"use client";

import { useState } from "react";
import { X } from "lucide-react";
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
  // Form states for different payment methods
  const [cashAmount, setCashAmount] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [debitBank, setDebitBank] = useState("BCA");
  const [debitAccountNumber, setDebitAccountNumber] = useState("");
  const [debitEDCMachine, setDebitEDCMachine] = useState("BCA");
  const [debitCardType, setDebitCardType] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditBank, setCreditBank] = useState("BCA");
  const [creditAccountNumber, setCreditAccountNumber] = useState("");
  const [creditEDCMachine, setCreditEDCMachine] = useState("BCA");
  const [creditCardType, setCreditCardType] = useState("");

  if (!isOpen) return null;

  const handlePayment = () => {
    // Add validation logic here if needed
    onPaymentSuccess();
  };

  const renderPaymentMethodContent = () => {
    return (
      <div className="space-y-6">
        {/* Cash Card with Form */}
        <div className="border border-gray-300 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h16V6H4zm2 1h2v1H6V7zm0 2h2v1H6V9zm4-2h8v1h-8V7z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900 text-lg">Cash</span>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                Rp
              </span>
              <Input
                type="text"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0"
                className="pl-10 bg-gray-50 border-gray-300 rounded-xl h-12 text-base"
              />
            </div>
          </div>
        </div>

        {/* Debit Card with Form */}
        <div className="border border-gray-300 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900 text-lg">
              Debit Card
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    Rp
                  </span>
                  <Input
                    type="text"
                    value={debitAmount}
                    onChange={(e) => setDebitAmount(e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-gray-50 border-gray-300 rounded-xl h-12 text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Nama Area
                </label>
                <Select value={debitBank} onValueChange={setDebitBank}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Account Number
                </label>
                <Input
                  type="text"
                  value={debitAccountNumber}
                  onChange={(e) => setDebitAccountNumber(e.target.value)}
                  placeholder="Enter Number"
                  className="bg-gray-50 border-gray-300 rounded-xl h-12"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  EDC Machine
                </label>
                <Select
                  value={debitEDCMachine}
                  onValueChange={setDebitEDCMachine}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Credit Card Type
                </label>
                <Input
                  type="text"
                  value={debitCardType}
                  onChange={(e) => setDebitCardType(e.target.value)}
                  placeholder="Enter/Select"
                  className="bg-gray-50 border-gray-300 rounded-xl h-12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Credit Card with Form */}
        <div className="border border-gray-300 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900 text-lg">
              Credit Card
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    Rp
                  </span>
                  <Input
                    type="text"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-gray-50 border-gray-300 rounded-xl h-12 text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Nama Area
                </label>
                <Select value={creditBank} onValueChange={setCreditBank}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Account Number
                </label>
                <Input
                  type="text"
                  value={creditAccountNumber}
                  onChange={(e) => setCreditAccountNumber(e.target.value)}
                  placeholder="Enter Number"
                  className="bg-gray-50 border-gray-300 rounded-xl h-12"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  EDC Machine
                </label>
                <Select
                  value={creditEDCMachine}
                  onValueChange={setCreditEDCMachine}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Credit Card Type
                </label>
                <Input
                  type="text"
                  value={creditCardType}
                  onChange={(e) => setCreditCardType(e.target.value)}
                  placeholder="Enter/Select"
                  className="bg-gray-50 border-gray-300 rounded-xl h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Option
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 h-full">
            {/* Left Column - Customer & Transaction Info */}
            <div className="p-6">
              {/* Customer Information */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-800 font-semibold text-sm">
                      84
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {orderDetails.customer}
                    </h3>
                    <p className="text-sm text-gray-600">+625490047055</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>August 17, 2025</p>
                    <p>09:52 AM</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="border border-gray-300 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">
                  Transaction Details
                </h4>

                {/* Product Items List - KEEP THIS SECTION */}
                <div className="max-h-[240px] overflow-y-auto space-y-4 mb-6">
                  {orderDetails.items.length > 0 ? (
                    orderDetails.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <span className="font-semibold text-gray-900 ml-4">
                              {item.quantity}x
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 mt-1">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No items in transaction
                    </div>
                  )}
                </div>

                {/* Transaction Summary */}
                <div className="border-t border-gray-300 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Sub Total</span>
                    <span className="font-semibold text-gray-900">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Misc</span>
                    <span className="font-semibold text-gray-900">Rp 0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">SC</span>
                    <span className="font-semibold text-gray-900">Rp 0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Discount</span>
                    <span className="font-semibold text-gray-900">Rp 0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Promo</span>
                    <span className="font-semibold text-gray-900">Rp 0</span>
                  </div>

                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Methods */}
            <div className="p-6 flex flex-col">
              <div className="flex-1">{renderPaymentMethodContent()}</div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
