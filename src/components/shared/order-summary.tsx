"use client";

import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  subtotal: number;
  misc?: number;
  serviceCharge?: number;
  discount?: number;
  promo?: number;
  className?: string;
  onPendingBill?: () => void;
  onPayNow?: () => void;
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
  // Calculate grand total
  const grandTotal = subtotal - discount + serviceCharge + misc - promo;

  return (
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

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <Button
          variant="destructive"
          className="w-full p-5"
          onClick={onPendingBill}
        >
          Pending Bill
        </Button>
        <Button variant="default" className="w-full p-5" onClick={onPayNow}>
          Pay Now
        </Button>
      </div>
    </div>
  );
}
