// components/shared/order-summary.tsx - FIXED VERSION WITH CORRECT TYPES
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
}: OrderSummaryProps) {
    const [isCustomerDoctorDialogOpen, setIsCustomerDoctorDialogOpen] =
        useState(false);
    const [isTransactionTypeDialogOpen, setIsTransactionTypeDialogOpen] =
        useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isSavePendingBillDialogOpen, setIsSavePendingBillDialogOpen] =
        useState(false);
    const [isPendingBillSavedDialogOpen, setIsPendingBillSavedDialogOpen] =
        useState(false);

    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerData | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(
        null
    );
    const [transactionTypeData, setTransactionTypeData] =
        useState<TransactionTypeData | null>(null);

    const grandTotal = subtotal - discount + serviceCharge + misc - promo;

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
        setIsCustomerDoctorDialogOpen(true);
    };

    const handleCustomerDoctorSubmit = (
        customerData: CustomerData,
        doctorData?: DoctorData
    ) => {
        console.log("✅ Customer & Doctor selected:", {
            customerData,
            doctorData,
        });

        setSelectedCustomer(customerData);
        setSelectedDoctor(doctorData || null);
        setIsCustomerDoctorDialogOpen(false);
        setIsTransactionTypeDialogOpen(true);
    };

    const handleTransactionTypeSubmit = (
        transactionData: TransactionTypeData
    ) => {
        console.log("✅ Transaction type selected:", transactionData);

        setTransactionTypeData(transactionData);
        setIsTransactionTypeDialogOpen(false);
        setIsPaymentDialogOpen(true);
    };

    const handlePaymentSuccess = () => {
        console.log("✅ Payment successful");

        setIsPaymentDialogOpen(false);

        if (onPayNow) {
            onPayNow(
                selectedCustomer || undefined,
                selectedDoctor || undefined
            );
        }

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
        setIsCustomerDoctorDialogOpen(false);
    };

    const handleTransactionTypeClose = () => {
        setIsTransactionTypeDialogOpen(false);
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

                {(selectedCustomer ||
                    selectedDoctor ||
                    transactionTypeData) && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Selected Information
                        </h4>
                        {selectedCustomer && (
                            <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Customer:</span>{" "}
                                {selectedCustomer.name}
                                {selectedCustomer.phone && (
                                    <span className="text-gray-500">
                                        {" "}
                                        • {selectedCustomer.phone}
                                    </span>
                                )}
                            </div>
                        )}
                        {selectedDoctor && (
                            <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Doctor:</span> Dr.{" "}
                                {selectedDoctor.fullname}
                                {selectedDoctor.sip && (
                                    <span className="text-gray-500">
                                        {" "}
                                        • {selectedDoctor.sip}
                                    </span>
                                )}
                            </div>
                        )}
                        {transactionTypeData && (
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                    Transaction:
                                </span>{" "}
                                {transactionTypeData.transactionType} •{" "}
                                {transactionTypeData.medicineType}
                                {transactionTypeData.availability !==
                                    "Available" && (
                                    <span className="text-orange-600">
                                        {" "}
                                        • {transactionTypeData.availability}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

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

            <CustomerDoctorDialog
                isOpen={isCustomerDoctorDialogOpen}
                onClose={handleCustomerDoctorClose}
                onSelectCustomer={handleCustomerSelect}
                onSelectDoctor={handleDoctorSelect}
                onSubmit={handleCustomerDoctorSubmit}
                mode="both"
                initialFocus="customer"
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
        </>
    );
}
