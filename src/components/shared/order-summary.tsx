"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CustomerDoctorDialog from "@/components/shared/customer-doctor-dialog";

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

interface OrderSummaryProps {
  subtotal: number;
  misc?: number;
  serviceCharge?: number;
  discount?: number;
  promo?: number;
  className?: string;
  onPendingBill?: () => void;
  onPayNow?: (customerData?: CustomerData, doctorData?: DoctorData) => void;
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
}: OrderSummaryProps) {
  const [isCustomerDoctorDialogOpen, setIsCustomerDoctorDialogOpen] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);

  // Calculate grand total
  const grandTotal = subtotal - discount + serviceCharge + misc - promo;

  const handlePayNowClick = () => {
    // Show customer and doctor selection dialog first
    setIsCustomerDoctorDialogOpen(true);
  };

  const handleCustomerDoctorSubmit = (
    customerData: CustomerData,
    doctorData: DoctorData
  ) => {
    setSelectedCustomer(customerData);
    setSelectedDoctor(doctorData);
    setIsCustomerDoctorDialogOpen(false);

    // Proceed to payment with customer and doctor data
    if (onPayNow) {
      onPayNow(customerData, doctorData);
    }
  };

  const handleCustomerSelect = (customer: CustomerData) => {
    setSelectedCustomer(customer);
  };

  const handleDoctorSelect = (doctor: DoctorData) => {
    setSelectedDoctor(doctor);
  };

  return (
    <>
      <div className={className}>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Sub Total</span>
            <span className="font-medium">{`Rp ${subtotal.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Misc</span>
            <span className="font-medium">{`Rp ${misc.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SC</span>
            <span className="font-medium">{`Rp ${serviceCharge.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium">{`Rp ${discount.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Promo</span>
            <span className="font-medium">{`Rp ${promo.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Grand Total</span>
            <span>{`Rp ${grandTotal.toLocaleString()}`}</span>
          </div>
        </div>

        {/* Selected Customer and Doctor Info */}
        {(selectedCustomer || selectedDoctor) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Selected Information
            </h4>
            {selectedCustomer && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Customer:</span>{" "}
                {selectedCustomer.name}
              </div>
            )}
            {selectedDoctor && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Doctor:</span>{" "}
                {selectedDoctor.fullname}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <Button
            variant="destructive"
            className="w-full p-5"
            onClick={onPendingBill}
          >
            Pending Bill
          </Button>
          <Button
            variant="default"
            className="w-full p-5"
            onClick={handlePayNowClick}
          >
            Pay Now
          </Button>
        </div>
      </div>

      {/* Customer Doctor Dialog */}
      <CustomerDoctorDialog
        isOpen={isCustomerDoctorDialogOpen}
        onClose={() => setIsCustomerDoctorDialogOpen(false)}
        onSelectCustomer={handleCustomerSelect}
        onSelectDoctor={handleDoctorSelect}
        onSubmit={handleCustomerDoctorSubmit}
        mode="both"
        initialFocus="customer"
      />
    </>
  );
}
