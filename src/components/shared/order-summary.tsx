// components/shared/order-summary.tsx - FIXED CTRL+SPACE FLOW INTEGRATION
"use client";

import { useState } from "react";
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
    onPayNow?: (customerData?: CustomerData, doctorData?: DoctorData) => void;
    products?: ProductItem[];
    // 🔥 NEW: Props for external dialog control from Ctrl+Space
    isCustomerDoctorDialogOpen?: boolean;
    onCustomerDoctorDialogClose?: () => void;
    triggerPaymentFlow?: boolean;
}

export default function OrderSummary({
    subtotal,
    misc = 0,
    serviceCharge = 0,
    discount = 0,
    promo = 0,
    className = "",
    onPendingBill,
    onPayNow,
    products = [],
    // 🔥 NEW: External dialog control props
    isCustomerDoctorDialogOpen = false,
    onCustomerDoctorDialogClose,
    triggerPaymentFlow = false,
}: OrderSummaryProps) {
    // 🔥 MODIFIED: Use external control or internal state
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

    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerData | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(
        null
    );
    const [transactionTypeData, setTransactionTypeData] =
        useState<TransactionTypeData | null>(null);

    const grandTotal = subtotal - discount + serviceCharge + misc - promo;

    // 🔥 COMPUTED: Determine which dialog state to use
    const isDialogOpen = isCustomerDoctorDialogOpen || internalDialogOpen;

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

    const handleCancelPendingBill = () => {
        // Just close the dialog without doing anything
    };

    const handlePayNowClick = () => {
        if (products.length === 0) {
            alert("No products to process payment");
            return;
        }

        // 🔥 FIXED: Use internal state for Pay Now button
        setInternalDialogOpen(true);
    };

    // 🔥 FIXED: Unified handler for both flows (Pay Now button & Ctrl+Space)
    const handleCustomerDoctorSubmit = (
        customerData: CustomerData,
        doctorData?: DoctorData
    ) => {
        console.log("🔥 CustomerDoctorSubmit called:", {
            customerData,
            doctorData,
            triggerPaymentFlow,
            isExternal: isCustomerDoctorDialogOpen,
        });

        // Save the selected data
        setSelectedCustomer(customerData);
        setSelectedDoctor(doctorData || null);

        // Close the customer/doctor dialog
        if (isCustomerDoctorDialogOpen && onCustomerDoctorDialogClose) {
            // External control - close via parent
            onCustomerDoctorDialogClose();
        } else {
            // Internal control - close internal dialog
            setInternalDialogOpen(false);
        }

        // 🔥 FIXED: Always proceed to Transaction Type dialog when triggerPaymentFlow is true
        // This should happen for BOTH Pay Now button and Ctrl+Space
        if (triggerPaymentFlow || !isCustomerDoctorDialogOpen) {
            console.log("🔥 Opening Transaction Type Dialog");
            setIsTransactionTypeDialogOpen(true);
        }
    };

    const handleTransactionTypeSubmit = (
        transactionData: TransactionTypeData
    ) => {
        console.log("✅ Transaction type selected:", transactionData);

        setTransactionTypeData(transactionData);
        setIsTransactionTypeDialogOpen(false);
        setIsPaymentDialogOpen(true);
    };

    const handlePaymentSuccess = (changeData?: {
        changeCash: number;
        changeCC: number;
        changeDC: number;
    }) => {
        console.log("✅ Payment successful with change data:", changeData);

        setIsPaymentDialogOpen(false);

        // Store change data for PaymentSuccessDialog
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

    // 🔥 FIXED: Unified close handler
    const handleCustomerDoctorClose = () => {
        if (isCustomerDoctorDialogOpen && onCustomerDoctorDialogClose) {
            // External control
            onCustomerDoctorDialogClose();
        } else {
            // Internal control
            setInternalDialogOpen(false);
        }

        // Reset states when closing
        resetAllStates();
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

        // Call the original onPayNow callback after closing success dialog
        if (onPayNow) {
            onPayNow(
                selectedCustomer || undefined,
                selectedDoctor || undefined
            );
        }
    };

    return (
        <>
            <div className={className}>
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
                        <span>{`Rp ${grandTotal.toLocaleString(
                            "id-ID"
                        )}`}</span>
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

            {/* 🔥 FIXED: Use unified dialog state and proper flow integration */}
            <CustomerDoctorDialog
                isOpen={isDialogOpen}
                onClose={handleCustomerDoctorClose}
                onSelectCustomer={handleCustomerSelect}
                onSelectDoctor={handleDoctorSelect}
                onSubmit={handleCustomerDoctorSubmit}
                mode="both"
                initialFocus="customer"
                triggerPaymentFlow={
                    triggerPaymentFlow || !isCustomerDoctorDialogOpen
                }
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

            {/* 🔥 FIXED: PaymentSuccessDialog with change data */}
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
