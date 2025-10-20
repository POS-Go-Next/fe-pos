"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CustomerDoctorDialog from "@/components/shared/customer-doctor-dialog";
import TransactionTypeDialog, {
  TransactionTypeData,
} from "@/components/shared/transaction-type-dialog";
import PaymentDialog from "@/components/shared/payment-dialog";
import SavePendingBillDialog from "@/components/shared/save-pending-bill-dialog";
import PendingBillSavedDialog from "@/components/shared/pending-bill-saved-dialog";
import PaymentSuccessDialog from "@/components/shared/payment-success-dialog";

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

interface OrderSummaryProps {
  subtotal: number;
  misc?: number;
  serviceCharge?: number;
  discount?: number;
  promo?: number;
  className?: string;
  onPendingBill?: () => void;
  onPaymentComplete?: () => void;
  products?: ProductItem[];
  isCustomerDoctorDialogOpen?: boolean;
  onCustomerDoctorDialogClose?: () => void;
  triggerPaymentFlow?: boolean;
  payNowButtonRef?: React.RefObject<HTMLButtonElement>;
  returnTransactionInfo?: {
    customerName?: string;
    doctorName?: string;
    isReturnTransaction: boolean;
  };
}

export default function OrderSummary({
  subtotal,
  misc = 0,
  serviceCharge = 0,
  discount = 0,
  promo = 0,
  className = "",
  onPendingBill,
  onPaymentComplete,
  products = [],
  isCustomerDoctorDialogOpen = false,
  onCustomerDoctorDialogClose,
  triggerPaymentFlow = false,
  payNowButtonRef,
  returnTransactionInfo,
}: OrderSummaryProps) {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [isTransactionTypeDialogOpen, setIsTransactionTypeDialogOpen] =
    useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSavePendingBillDialogOpen, setIsSavePendingBillDialogOpen] =
    useState(false);
  const [isPendingBillSavedDialogOpen, setIsPendingBillSavedDialogOpen] =
    useState(false);
  const [isPaymentSuccessDialogOpen, setIsPaymentSuccessDialogOpen] =
    useState(false);
  const [changeData, setChangeData] = useState<{
    changeCash: number;
    changeCC: number;
    changeDC: number;
  }>({ changeCash: 0, changeCC: 0, changeDC: 0 });

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);
  const [transactionTypeData, setTransactionTypeData] =
    useState<TransactionTypeData | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const grandTotal = subtotal - discount + serviceCharge + misc - promo;
  const isDialogOpen = isCustomerDoctorDialogOpen || internalDialogOpen;

  // Pre-populate customer/doctor info from return transaction
  useEffect(() => {
    if (returnTransactionInfo?.isReturnTransaction) {
      if (returnTransactionInfo.customerName) {
        setSelectedCustomer({
          id: 0, // We don't have the ID from the return transaction
          name: returnTransactionInfo.customerName,
          gender: "female", // Default values since we only have the name
          age: "",
          phone: "",
          address: "",
          status: "true",
        });
      }
      
      if (returnTransactionInfo.doctorName) {
        setSelectedDoctor({
          id: 0, // We don't have the ID from the return transaction
          fullname: returnTransactionInfo.doctorName,
          phone: "",
          address: "",
          sip: "",
        });
      }
    }
  }, [returnTransactionInfo]);

  const refetchInvoiceNumber = async () => {
    try {window.dispatchEvent(new CustomEvent("refetch-transaction-info"));
    } catch (error) {
      console.error("Error refetching invoice:", error);
    }
  };

  const handlePendingBillClick = () => {
    if (products.length === 0) {
      alert("No products to save as pending bill");
      return;
    }
    setIsSavePendingBillDialogOpen(true);
  };

  const handleSavePendingBill = () => {
    setIsPendingBillSavedDialogOpen(true);

    if (onPendingBill) {
      onPendingBill();
    }

    resetAllStates();
  };

  const handleCancelPendingBill = () => {};

  const handlePayNowClick = async () => {
    if (products.length === 0) {
      alert("No products to process payment");
      return;
    }await refetchInvoiceNumber();
    setDialogKey((prev) => prev + 1);
    resetAllStates();
    setInternalDialogOpen(true);
  };

  const handleCustomerDoctorSubmit = (
    customerData: CustomerData,
    doctorData?: DoctorData
  ) => {setSelectedCustomer(customerData);
    setSelectedDoctor(doctorData || null);

    if (isCustomerDoctorDialogOpen && onCustomerDoctorDialogClose) {
      onCustomerDoctorDialogClose();
    } else {
      setInternalDialogOpen(false);
    }

    if (triggerPaymentFlow || !isCustomerDoctorDialogOpen) {setIsTransactionTypeDialogOpen(true);
    }
  };

  const handleTransactionTypeSubmit = (
    transactionData: TransactionTypeData
  ) => {setTransactionTypeData(transactionData);
    setIsTransactionTypeDialogOpen(false);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = (changeData?: {
    changeCash: number;
    changeCC: number;
    changeDC: number;
  }) => {setIsPaymentDialogOpen(false);

    if (changeData) {
      setChangeData(changeData);
    }

    setIsPaymentSuccessDialogOpen(true);

    resetAllStates();
  };

  const resetAllStates = () => {
    setSelectedCustomer(null);
    setSelectedDoctor(null);
    setTransactionTypeData(null);
  };

  const handleCustomerSelect = (customer: CustomerData) => {
    setSelectedCustomer(customer);
  };

  const handleDoctorSelect = (doctor: DoctorData) => {
    setSelectedDoctor(doctor);
  };

  const handleCustomerDoctorClose = () => {
    if (isCustomerDoctorDialogOpen && onCustomerDoctorDialogClose) {
      onCustomerDoctorDialogClose();
    } else {
      setInternalDialogOpen(false);
    }
    resetAllStates();
    setDialogKey((prev) => prev + 1);
  };

  const handleTransactionTypeClose = () => {
    setIsTransactionTypeDialogOpen(false);
    resetAllStates();
  };

  const handlePaymentClose = () => {
    setIsPaymentDialogOpen(false);
    resetAllStates();
  };

  const handleSavePendingBillClose = () => {
    setIsSavePendingBillDialogOpen(false);
  };

  const handlePendingBillSavedClose = () => {
    setIsPendingBillSavedDialogOpen(false);
  };

  const handlePendingBillSavedDone = () => {
    setIsPendingBillSavedDialogOpen(false);
  };

  const handlePaymentSuccessClose = () => {
    setIsPaymentSuccessDialogOpen(false);

    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  return (
    <>
      <div className={className}>
        {returnTransactionInfo?.isReturnTransaction && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-orange-800 text-sm font-medium">Return Transaction</span>
            </div>
            {returnTransactionInfo.customerName && (
              <p className="text-orange-700 text-xs mt-1">
                Customer: {returnTransactionInfo.customerName}
                {returnTransactionInfo.doctorName && ` | Doctor: ${returnTransactionInfo.doctorName}`}
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Sub Total</span>
            <span className="font-medium">{`Rp ${subtotal.toLocaleString(
              "id-ID"
            )}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Misc</span>
            <span className="font-medium">{`Rp ${misc.toLocaleString(
              "id-ID"
            )}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SC</span>
            <span className="font-medium">{`Rp ${serviceCharge.toLocaleString(
              "id-ID"
            )}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium">{`Rp ${discount.toLocaleString(
              "id-ID"
            )}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Promo</span>
            <span className="font-medium">{`Rp ${promo.toLocaleString(
              "id-ID"
            )}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Grand Total</span>
            <span>{`Rp ${grandTotal.toLocaleString("id-ID")}`}</span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button
            variant="destructive"
            className="w-full p-5 text-white font-medium"
            onClick={handlePendingBillClick}
            disabled={products.length === 0}
          >
            Pending Bill
          </Button>
          <Button
            ref={payNowButtonRef}
            variant="default"
            className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={handlePayNowClick}
            disabled={products.length === 0}
          >
            Pay Now
          </Button>
        </div>
      </div>

      <SavePendingBillDialog
        isOpen={isSavePendingBillDialogOpen}
        onClose={handleSavePendingBillClose}
        onSave={handleSavePendingBill}
        onCancel={handleCancelPendingBill}
      />

      <PendingBillSavedDialog
        isOpen={isPendingBillSavedDialogOpen}
        onClose={handlePendingBillSavedClose}
        onDone={handlePendingBillSavedDone}
      />

      <CustomerDoctorDialog
        key={dialogKey}
        isOpen={isDialogOpen}
        onClose={handleCustomerDoctorClose}
        onSelectCustomer={handleCustomerSelect}
        onSelectDoctor={handleDoctorSelect}
        onSubmit={handleCustomerDoctorSubmit}
        initialCustomer={selectedCustomer || undefined}
        initialDoctor={selectedDoctor || undefined}
        mode="both"
        initialFocus="customer"
        triggerPaymentFlow={triggerPaymentFlow || !isCustomerDoctorDialogOpen}
      />

      <TransactionTypeDialog
        isOpen={isTransactionTypeDialogOpen}
        onClose={handleTransactionTypeClose}
        onSubmit={handleTransactionTypeSubmit}
      />

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={handlePaymentClose}
        onPaymentSuccess={handlePaymentSuccess}
        totalAmount={grandTotal}
        orderDetails={{
          customer: selectedCustomer?.name || "Unknown Customer",
          items: products.map((p) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
          })),
        }}
        customerData={selectedCustomer}
        doctorData={selectedDoctor}
        transactionTypeData={transactionTypeData}
        products={products}
      />

      <PaymentSuccessDialog
        isOpen={isPaymentSuccessDialogOpen}
        onClose={handlePaymentSuccessClose}
        changeCash={changeData.changeCash}
        changeCC={changeData.changeCC}
        changeDC={changeData.changeDC}
      />
    </>
  );
}
