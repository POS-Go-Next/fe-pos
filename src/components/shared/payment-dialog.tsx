"use client";

import { useState, useMemo } from "react";
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
import { showErrorAlert, showLoadingAlert } from "@/lib/swal";
import Swal from "sweetalert2";
import { processTransaction } from "@/lib/transaction-processor";
import type { StockData } from "@/types/stock";

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
}

interface TransactionTypeData {
  medicineType: "Compounded" | "Ready to Use";
  transactionType: "Full Prescription" | "Partial Prescription";
  availability: "Available" | "Patient Credit";
}

interface ProductItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount: number;
  sc: number;
  misc: number;
  promo: number;
  total: number;
  stockData?: {
    kode_brg: string;
  };
  up?: string;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (changeData?: {
    changeCash: number;
    changeCC: number;
    changeDC: number;
  }) => void;
  totalAmount: number;
  orderDetails: {
    customer: string;
    items: { name: string; quantity: number; price: number }[];
  };
  customerData?: CustomerData | null;
  doctorData?: DoctorData | null;
  transactionTypeData?: TransactionTypeData | null;
  products?: ProductItem[];
  returnTransactionInfo?: {
    customerName?: string;
    doctorName?: string;
    invoiceNumber?: string;
    isReturnTransaction: boolean;
  };
}

export default function PaymentDialog({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmount: _totalAmount,
  orderDetails,
  customerData,
  doctorData,
  transactionTypeData,
  products = [],
  returnTransactionInfo,
}: PaymentDialogProps) {
  const [cashAmount, setCashAmount] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [debitBank, setDebitBank] = useState("BCA");
  const [debitAccountNumber, setDebitAccountNumber] = useState("");
  const [debitEDCMachine, setDebitEDCMachine] = useState("OVO");
  const [debitCardType, setDebitCardType] = useState("Visa");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditBank, setCreditBank] = useState("BCA");
  const [creditAccountNumber, setCreditAccountNumber] = useState("");
  const [creditEDCMachine, setCreditEDCMachine] = useState("OVO");
  const [creditCardType, setCreditCardType] = useState("Visa");
  const [isProcessing, setIsProcessing] = useState(false);

  const correctTotalAmount = useMemo(() => {
    const subtotal = products.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    const misc = products.reduce((sum, p) => sum + (p.misc || 0), 0);
    const sc = products.reduce((sum, p) => sum + (p.sc || 0), 0);
    const discount = products.reduce(
      (sum, p) => sum + (p.subtotal || 0) * ((p.discount || 0) / 100),
      0
    );
    const promo = products.reduce((sum, p) => sum + (p.promo || 0), 0);

    return subtotal + misc + sc - discount - promo;
  }, [products]);

  if (!isOpen) return null;

  const handleCashFullAmount = () => {
    setCashAmount(correctTotalAmount.toString());
  };

  const handleDebitFullAmount = () => {
    setDebitAmount(correctTotalAmount.toString());
  };

  const handleCreditFullAmount = () => {
    setCreditAmount(correctTotalAmount.toString());
  };



  const calculatePayment = () => {
    const cash = parseFloat(cashAmount) || 0;
    const debit = parseFloat(debitAmount) || 0;
    const credit = parseFloat(creditAmount) || 0;

    const totalPaid = cash + debit + credit;

    let changeCash = 0;
    let changeDC = 0;
    let changeCC = 0;

    if (totalPaid > correctTotalAmount) {
      const totalChange = totalPaid - correctTotalAmount;

      if (credit >= totalChange) {
        changeCC = totalChange;
      } else if (debit >= totalChange) {
        changeDC = totalChange;
      } else if (cash >= totalChange) {
        changeCash = totalChange;
      } else {
        changeCash = totalChange;
      }
    }

    return {
      cash,
      debit,
      credit,
      totalPaid,
      changeCash,
      changeDC,
      changeCC,
    };
  };

  const handlePayment = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      showLoadingAlert(
        "Processing Payment",
        "Please wait while we process your payment..."
      );

      const payment = calculatePayment();

      if (payment.totalPaid < correctTotalAmount) {
        Swal.close();
        showErrorAlert(
          "Insufficient Payment",
          "Payment amount is less than total amount required."
        );
        return;
      }

      if (!customerData?.id) {
        Swal.close();
        showErrorAlert(
          "Missing Customer",
          "Customer information is required for transaction."
        );
        return;
      }

      if (!products || products.length === 0) {
        Swal.close();
        showErrorAlert(
          "No Products",
          "At least one product is required for transaction."
        );
        return;
      }

      const subTotal = products.reduce((sum, p) => sum + (p.subtotal || 0), 0);
      const totalMisc = products.reduce((sum, p) => sum + (p.misc || 0), 0);
      const totalServiceFee = products.reduce((sum, p) => sum + (p.sc || 0), 0);
      const totalDiscount = products.reduce(
        (sum, p) => sum + (p.subtotal || 0) * ((p.discount || 0) / 100),
        0
      );
      const totalPromo = products.reduce((sum, p) => sum + (p.promo || 0), 0);

      // Convert products to ProductTableItem format for transaction processor
      const convertedProducts = products.map(product => ({
        ...product,
        stockData: (product.stockData && 'nama_brg' in product.stockData && 'id_dept' in product.stockData)
          ? product.stockData as StockData
          : {
              kode_brg: product.stockData?.kode_brg || product.id.toString(),
              nama_brg: product.name,
              id_dept: "A2",
              isi: 1,
              id_satuan: 1,
              strip: 1,
              mark_up: 0,
              hb_netto: 0,
              hb_gross: 0,
              hj_ecer: product.price,
              hj_bbs: product.price,
              id_kategori: "001",
              id_pabrik: "001",
              barcode: "",
              q_bbs: 1,
              satuan: "pcs",
              hna: product.price,
            } as StockData,
      }));

      // Process transaction using unified processor
      const result = returnTransactionInfo?.isReturnTransaction 
        ? await processTransaction({
            type: "item-based-return",
            products: convertedProducts,
            customerData: {
              id: customerData.id.toString(),
              name: customerData.name,
              phone: customerData.phone,
            },
            doctorData: doctorData ? {
              id: doctorData.id.toString(),
              fullname: doctorData.fullname,
            } : null,
            paymentInfo: {
              cash: payment.cash,
              changeCash: payment.changeCash,
              changeCC: payment.changeCC,
              changeDC: payment.changeDC,
              credit: payment.credit,
              debit: payment.debit,
              creditAccountNumber,
              debitAccountNumber,
              creditEDCMachine,
              debitEDCMachine,
              creditBank,
              debitBank,
              creditCardType,
              debitCardType,
            },
            totals: {
              subTotal,
              totalMisc,
              totalServiceFee,
              totalDiscount,
              totalPromo,
              correctTotalAmount,
            },
            transactionTypeData,
            returnReason: "Item-based return",
            originalInvoiceNumber: returnTransactionInfo.invoiceNumber || "", // Pass original invoice number
          })
        : await processTransaction({
            type: "regular",
            products: convertedProducts,
            customerData: {
              id: customerData.id.toString(),
              name: customerData.name,
              phone: customerData.phone,
            },
            doctorData: doctorData ? {
              id: doctorData.id.toString(),
              fullname: doctorData.fullname,
            } : null,
            paymentInfo: {
              cash: payment.cash,
              changeCash: payment.changeCash,
              changeCC: payment.changeCC,
              changeDC: payment.changeDC,
              credit: payment.credit,
              debit: payment.debit,
              creditAccountNumber,
              debitAccountNumber,
              creditEDCMachine,
              debitEDCMachine,
              creditBank,
              debitBank,
              creditCardType,
              debitCardType,
            },
            totals: {
              subTotal,
              totalMisc,
              totalServiceFee,
              totalDiscount,
              totalPromo,
              correctTotalAmount,
            },
            transactionTypeData,
          });

      Swal.close();

      if (!result.success) {
        showErrorAlert("Payment Failed", result.message || "Payment failed. Please try again.");
        return;
      }

      resetForm();
      onPaymentSuccess({
        changeCash: payment.changeCash,
        changeCC: payment.changeCC,
        changeDC: payment.changeDC,
      });
    } catch (error) {
      console.error("Payment error:", error);
      Swal.close();

      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showErrorAlert("Payment Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCashAmount("");
    setDebitAmount("");
    setDebitBank("BCA");
    setDebitAccountNumber("");
    setDebitEDCMachine("OVO");
    setDebitCardType("Visa");
    setCreditAmount("");
    setCreditBank("BCA");
    setCreditAccountNumber("");
    setCreditEDCMachine("OVO");
    setCreditCardType("Visa");
  };

  const handleClose = () => {
    if (isProcessing) return;
    resetForm();
    onClose();
  };

  const renderPaymentMethodContent = () => {
    return (
      <div className="space-y-6">
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
            <button
              onClick={handleCashFullAmount}
              disabled={isProcessing}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Full Amount
            </button>
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
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0"
                className="pl-10 bg-gray-50 border-gray-300 rounded-xl h-12 text-base"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

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
            <button
              onClick={handleDebitFullAmount}
              disabled={isProcessing}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Full Amount
            </button>
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
                    type="number"
                    value={debitAmount}
                    onChange={(e) => setDebitAmount(e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-gray-50 border-gray-300 rounded-xl h-12 text-base"
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Bank
                </label>
                <Select
                  value={debitBank}
                  onValueChange={setDebitBank}
                  disabled={isProcessing}
                >
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
                    onChange={(e) =>
                      setDebitAccountNumber(e.target.value.slice(0, 16))
                    }
                    maxLength={16}
                    inputMode="numeric"
                  placeholder="Enter Number"
                  className="bg-gray-50 border-gray-300 rounded-xl h-12"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  EDC Machine
                </label>
                <Select
                  value={debitEDCMachine}
                  onValueChange={setDebitEDCMachine}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OVO">OVO</SelectItem>
                    <SelectItem value="SHOPEE">SHOPEE</SelectItem>
                    <SelectItem value="LINKAJA">LINKAJA</SelectItem>
                    <SelectItem value="YOUTAP">YOUTAP</SelectItem>
                    <SelectItem value="GAJA">GAJA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Card Type
                </label>
                <Select
                  value={debitCardType}
                  onValueChange={setDebitCardType}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="MasterCard">MasterCard</SelectItem>
                    <SelectItem value="JCB">JCB</SelectItem>
                    <SelectItem value="Amex">Amex</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

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
            <button
              onClick={handleCreditFullAmount}
              disabled={isProcessing}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Full Amount
            </button>
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
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-gray-50 border-gray-300 rounded-xl h-12 text-base"
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Bank
                </label>
                <Select
                  value={creditBank}
                  onValueChange={setCreditBank}
                  disabled={isProcessing}
                >
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
                  onChange={(e) =>
                    setCreditAccountNumber(e.target.value.slice(0, 16))
                  }
                  maxLength={16}
                  inputMode="numeric"
                  placeholder="Enter Number"
                  className="bg-gray-50 border-gray-300 rounded-xl h-12"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  EDC Machine
                </label>
                <Select
                  value={creditEDCMachine}
                  onValueChange={setCreditEDCMachine}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OVO">OVO</SelectItem>
                    <SelectItem value="SHOPEE">SHOPEE</SelectItem>
                    <SelectItem value="LINKAJA">LINKAJA</SelectItem>
                    <SelectItem value="YOUTAP">YOUTAP</SelectItem>
                    <SelectItem value="GAJA">GAJA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Card Type
                </label>
                <Select
                  value={creditCardType}
                  onValueChange={setCreditCardType}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-300 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="MasterCard">MasterCard</SelectItem>
                    <SelectItem value="JCB">JCB</SelectItem>
                    <SelectItem value="Amex">Amex</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Option
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 h-full">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-800 font-semibold text-sm">
                      {customerData?.id || "??"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {customerData?.name || orderDetails.customer}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {customerData?.phone || "+625490047055"}
                    </p>
                    {doctorData && (
                      <p className="text-sm text-blue-600">
                        Dr. {doctorData.fullname}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p>
                      {new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">
                  Transaction Details
                </h4>

                <div className="max-h-[240px] overflow-y-auto space-y-4 mb-6">
                  {products.length > 0 ? (
                    products.map((item, index) => (
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
                            Rp {(item.price || 0).toLocaleString("id-ID")}
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

                <div className="border-t border-gray-300 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Sub Total</span>
                    <span className="font-semibold text-gray-900">
                      Rp{" "}
                      {products
                        .reduce((sum, p) => sum + (p.subtotal || 0), 0)
                        .toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Misc</span>
                    <span className="font-semibold text-gray-900">
                      Rp{" "}
                      {products
                        .reduce((sum, p) => sum + (p.misc || 0), 0)
                        .toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">SC</span>
                    <span className="font-semibold text-gray-900">
                      Rp{" "}
                      {products
                        .reduce((sum, p) => sum + (p.sc || 0), 0)
                        .toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Discount</span>
                    <span className="font-semibold text-gray-900">
                      Rp{" "}
                      {products
                        .reduce(
                          (sum, p) =>
                            sum + (p.subtotal || 0) * ((p.discount || 0) / 100),
                          0
                        )
                        .toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Promo</span>
                    <span className="font-semibold text-gray-900">
                      Rp{" "}
                      {products
                        .reduce((sum, p) => sum + (p.promo || 0), 0)
                        .toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="border-t border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        Rp {correctTotalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col">
              <div className="flex-1">{renderPaymentMethodContent()}</div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
