// components/shared/customer-info-with-dialog.tsx - CORRECTED VERSION
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerDoctorDialog from "./customer-doctor-dialog";

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
  name: string;
  doctorId: string;
  phone: string;
  address: string;
}

interface CustomerInfoWithDialogProps {
  selectedCustomer?: string;
  selectedDoctor?: string;
  onSelectCustomer?: (customerName: string) => void;
  onSelectDoctor?: (doctorName: string) => void;
  className?: string;
  useDialog?: boolean;
}

export default function CustomerInfoWithDialog({
  selectedCustomer,
  selectedDoctor,
  onSelectCustomer,
  onSelectDoctor,
  className = "",
  useDialog = true,
}: CustomerInfoWithDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogInitialFocus, setDialogInitialFocus] = useState<
    "customer" | "doctor"
  >("customer");

  // Handle opening dialog with customer focus
  const handleOpenCustomerDialog = () => {
    setDialogInitialFocus("customer");
    setIsDialogOpen(true);
  };

  // Handle opening dialog with doctor focus
  const handleOpenDoctorDialog = () => {
    setDialogInitialFocus("doctor");
    setIsDialogOpen(true);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: CustomerData) => {
    if (onSelectCustomer) {
      onSelectCustomer(customer.name);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor: DoctorData) => {
    if (onSelectDoctor) {
      onSelectDoctor(doctor.name);
    }
  };

  // Handle form submission
  const handleSubmit = (customerData: CustomerData, doctorData: DoctorData) => {
    if (onSelectCustomer) {
      onSelectCustomer(customerData.name);
    }
    if (onSelectDoctor) {
      onSelectDoctor(doctorData.name);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className={className}>
        <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
        <div className="space-y-4">
          {/* Customer Name Button - Opens Dialog with Customer Focus */}
          <div>
            <label className="text-sm text-gray-600">Customer Name</label>
            <Button
              variant="outline"
              className="w-full justify-between text-left"
              onClick={handleOpenCustomerDialog}
            >
              {selectedCustomer || "Select Customer"}
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Doctor Name Button - Opens Dialog with Doctor Focus */}
          <div>
            <label className="text-sm text-gray-600">Doctor Name</label>
            <Button
              variant="outline"
              className="w-full justify-between text-left"
              onClick={handleOpenDoctorDialog}
            >
              {selectedDoctor || "Select Doctor"}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Single Combined Dialog */}
      {/* <CustomerDoctorDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectCustomer={handleCustomerSelect}
        onSelectDoctor={handleDoctorSelect}
        onSubmit={handleSubmit}
        mode="both"
        initialFocus={dialogInitialFocus}
      /> */}
    </>
  );
}
