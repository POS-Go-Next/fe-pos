// components/shared/customer-doctor-dialog.tsx
"use client";

import React, { useState } from "react";
import { X, Plus, User, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type DialogMode = "customer" | "doctor" | "both";

interface CustomerDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerData) => void;
  onSelectDoctor: (doctor: DoctorData) => void;
  onSubmit: (customerData: CustomerData, doctorData: DoctorData) => void;
  initialCustomer?: CustomerData;
  initialDoctor?: DoctorData;
  mode?: DialogMode;
  initialFocus?: "customer" | "doctor";
}

export default function CustomerDoctorDialog({
  isOpen,
  onClose,
  onSelectCustomer,
  onSelectDoctor,
  onSubmit,
  initialCustomer,
  initialDoctor,
  mode = "both",
  initialFocus = "customer",
}: CustomerDoctorDialogProps) {
  const [currentFocus, setCurrentFocus] = useState<"customer" | "doctor">(
    initialFocus
  );

  // Customer form state
  const [customerForm, setCustomerForm] = useState<CustomerData>({
    id: 0,
    name: "",
    gender: "Female",
    age: "",
    phone: "+62 ",
    address: "",
    status: "AKTIF",
  });

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState<DoctorData>({
    id: 0,
    name: "",
    doctorId: "",
    phone: "+62 ",
    address: "",
  });

  // Handle customer form changes
  const handleCustomerChange = (field: keyof CustomerData, value: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle doctor form changes
  const handleDoctorChange = (field: keyof DoctorData, value: string) => {
    setDoctorForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (mode === "customer" && customerForm.name) {
      onSelectCustomer(customerForm);
      onClose();
    } else if (mode === "doctor" && doctorForm.name) {
      onSelectDoctor(doctorForm);
      onClose();
    } else if (mode === "both" && customerForm.name && doctorForm.name) {
      onSubmit(customerForm, doctorForm);
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    onClose();
    // Reset form
    setCustomerForm({
      id: 0,
      name: "",
      gender: "Female",
      age: "",
      phone: "+62 ",
      address: "",
      status: "AKTIF",
    });
    setDoctorForm({
      id: 0,
      name: "",
      doctorId: "",
      phone: "+62 ",
      address: "",
    });
    setCurrentFocus(initialFocus);
  };

  // Get dialog title based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case "customer":
        return "Add Customer";
      case "doctor":
        return "Add Doctor";
      default:
        return "Enter Customer and Doctor Data";
    }
  };

  // Reset focus when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentFocus(initialFocus);
    }
  }, [isOpen, initialFocus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {getDialogTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Customer Info Section - Only show if mode is "customer" or "both" */}
          {(mode === "customer" || mode === "both") && (
            <div className={`${mode === "both" ? "mb-8" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Customer Info
                  </h3>
                </div>
                {mode === "both" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setCurrentFocus("customer")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Customer
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Customer Name"
                    value={customerForm.name}
                    onChange={(e) =>
                      handleCustomerChange("name", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <Select
                    value={customerForm.gender}
                    onValueChange={(value) =>
                      handleCustomerChange("gender", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Age Customer"
                    value={customerForm.age}
                    onChange={(e) =>
                      handleCustomerChange("age", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    placeholder="+62 6214646 5757"
                    value={customerForm.phone}
                    onChange={(e) =>
                      handleCustomerChange("phone", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Address"
                    value={customerForm.address}
                    onChange={(e) =>
                      handleCustomerChange("address", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={customerForm.status}
                    onValueChange={(value) =>
                      handleCustomerChange("status", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AKTIF">AKTIF</SelectItem>
                      <SelectItem value="TIDAK AKTIF">TIDAK AKTIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Info Section - Only show if mode is "doctor" or "both" */}
          {(mode === "doctor" || mode === "both") && (
            <div className={`${mode === "both" ? "mb-6" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Doctor Info
                  </h3>
                </div>
                {mode === "both" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setCurrentFocus("doctor")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Doctor
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Doctor Name"
                    value={doctorForm.name}
                    onChange={(e) => handleDoctorChange("name", e.target.value)}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Doctor ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Doctor ID"
                    value={doctorForm.doctorId}
                    onChange={(e) =>
                      handleDoctorChange("doctorId", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    placeholder="+62 8214646 5757"
                    value={doctorForm.phone}
                    onChange={(e) =>
                      handleDoctorChange("phone", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Doctor Address"
                    value={doctorForm.address}
                    onChange={(e) =>
                      handleDoctorChange("address", e.target.value)
                    }
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={
              (mode === "customer" && !customerForm.name.trim()) ||
              (mode === "doctor" && !doctorForm.name.trim()) ||
              (mode === "both" &&
                (!customerForm.name.trim() || !doctorForm.name.trim()))
            }
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
