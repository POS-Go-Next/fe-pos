"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CustomerInfoProps {
  selectedCustomer?: string;
  selectedDoctor?: string;
  onSelectCustomer?: () => void;
  onSelectDoctor?: () => void;
  className?: string;
}

export default function CustomerInfo({
  selectedCustomer,
  selectedDoctor,
  onSelectCustomer,
  onSelectDoctor,
  className = "",
}: CustomerInfoProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Customer Name</label>
          <Button
            variant="outline"
            className="w-full justify-between text-left"
            onClick={onSelectCustomer}
            asChild={!onSelectCustomer}
          >
            {onSelectCustomer ? (
              <>
                {selectedCustomer || "Select Customer"}
                <ChevronRight size={16} />
              </>
            ) : (
              <Link href="/create-order/select-product/customer">
                {selectedCustomer || "Select Customer"}
                <ChevronRight size={16} />
              </Link>
            )}
          </Button>
        </div>
        <div>
          <label className="text-sm text-gray-600">Doctor Name</label>
          <Button
            variant="outline"
            className="w-full justify-between text-left"
            onClick={onSelectDoctor}
            asChild={!onSelectDoctor}
          >
            {onSelectDoctor ? (
              <>
                {selectedDoctor || "Select Doctor"}
                <ChevronRight size={16} />
              </>
            ) : (
              <Link href="/create-order/select-product/doctor">
                {selectedDoctor || "Select Doctor"}
                <ChevronRight size={16} />
              </Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
