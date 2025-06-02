"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SelectCustomerDialog from "./select-customer-dialog";

interface CustomerInfoWithDialogProps {
  selectedCustomer?: string;
  selectedDoctor?: string;
  onSelectCustomer?: (customerName: string) => void;
  onSelectDoctor?: (doctorName: string) => void;
  className?: string;
  useDialog?: boolean;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  dateAdded: string;
}

export default function CustomerInfoWithDialog({
  selectedCustomer,
  selectedDoctor,
  onSelectCustomer,
  onSelectDoctor,
  className = "",
  useDialog = true,
}: CustomerInfoWithDialogProps) {
  // const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);

  // Handle customer selection from dialog
  const handleCustomerSelect = (customer: Customer) => {
    if (onSelectCustomer) {
      onSelectCustomer(customer.name);
    }
  };

  // Handle doctor selection (can be implemented similarly)

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Doctor Name</label>
          {useDialog && onSelectDoctor ? (
            <>
              <Button
                variant="outline"
                className="w-full justify-between text-left"
                onClick={() => setIsDoctorDialogOpen(true)}
              >
                {selectedDoctor || "Select Doctor"}
                <ChevronRight size={16} />
              </Button>

              {/* Tambahkan DoctorSelectionDialog (perlu dibuat) */}
              {isDoctorDialogOpen && (
                <SelectCustomerDialog
                  isOpen={isDoctorDialogOpen}
                  onClose={() => setIsDoctorDialogOpen(false)}
                  onSelectCustomer={(doctor) => {
                    if (onSelectDoctor) onSelectDoctor(doctor.name);
                  }}
                />
              )}
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-between text-left"
              asChild
            >
              <Link href="/create-order/select-product/doctor">
                {selectedDoctor || "Select Doctor"}
                <ChevronRight size={16} />
              </Link>
            </Button>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600">Doctor Name</label>
          <Button
            variant="outline"
            className="w-full justify-between text-left"
            onClick={
              onSelectDoctor ? () => setIsDoctorDialogOpen(true) : undefined
            }
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
