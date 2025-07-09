// components/shared/add-customer-dialog.tsx
"use client";

import { useState } from "react";
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

interface CustomerData {
  id: number;
  name: string;
  gender: string;
  age: string;
  phone: string;
  address: string;
  status: string;
}

interface AddCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: CustomerData) => void;
}

export default function AddCustomerDialog({
  isOpen,
  onClose,
  onSubmit,
}: AddCustomerDialogProps) {
  const [customerForm, setCustomerForm] = useState<CustomerData>({
    id: 0,
    name: "",
    gender: "Female",
    age: "",
    phone: "+62 ",
    address: "",
    status: "AKTIF",
  });

  const handleChange = (field: keyof CustomerData, value: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (customerForm.name.trim()) {
      onSubmit({
        ...customerForm,
        id: Date.now(), // Generate simple ID
      });
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
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setCustomerForm({
      id: 0,
      name: "",
      gender: "Female",
      age: "",
      phone: "+62 ",
      address: "",
      status: "AKTIF",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Customer</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
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
                onChange={(e) => handleChange("name", e.target.value)}
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
                onValueChange={(value) => handleChange("gender", value)}
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
                onChange={(e) => handleChange("age", e.target.value)}
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
                onChange={(e) => handleChange("phone", e.target.value)}
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
                onChange={(e) => handleChange("address", e.target.value)}
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
                onValueChange={(value) => handleChange("status", value)}
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
            disabled={!customerForm.name.trim()}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
