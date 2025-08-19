// components/shared/add-customer-dialog.tsx
"use client";

import { useState } from "react";
import { X, User } from "lucide-react";
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
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    const [customerForm, setCustomerForm] = useState<CustomerData>({
        id: 0,
        name: "",
        gender: "Female",
        age: "",
        phone: "+62",
        address: "",
        status: "AKTIF",
    });

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!customerForm.name.trim()) {
            errors.name = "Customer name is required";
        }

        if (!customerForm.age || parseInt(customerForm.age) <= 0) {
            errors.age = "Valid age is required";
        }

        if (
            !customerForm.phone ||
            customerForm.phone === "+62" ||
            customerForm.phone.length < 10
        ) {
            errors.phone = "Valid phone number is required";
        }

        if (!customerForm.address.trim()) {
            errors.address = "Address is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (field: keyof CustomerData, value: string) => {
        setCustomerForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear validation error for the field being edited
        if (validationErrors[field]) {
            setValidationErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Prepare the request body according to API specification
            const requestBody = {
                nm_cust: customerForm.name,
                usia_cust: parseInt(customerForm.age),
                gender: customerForm.gender.toLowerCase(),
                telp_cust: customerForm.phone.replace("+", ""),
                al_cust: customerForm.address,
                status: customerForm.status === "AKTIF",
            };

            const response = await fetch("/api/customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create customer");
            }

            // Transform the response data back to the format expected by the parent component
            const createdCustomer: CustomerData = {
                id: data.data.kd_cust,
                name: data.data.nm_cust,
                gender: data.data.gender === "male" ? "Male" : "Female",
                age: data.data.usia_cust.toString(),
                phone: `+${data.data.telp_cust}`,
                address: data.data.al_cust,
                status: data.data.status ? "AKTIF" : "TIDAK AKTIF",
            };

            onSubmit(createdCustomer);
            handleClose();
        } catch (error) {
            console.error("Error creating customer:", error);
            setValidationErrors({
                submit:
                    error instanceof Error
                        ? error.message
                        : "Failed to create customer",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return; // Prevent closing while submitting

        onClose();
        // Reset form
        setCustomerForm({
            id: 0,
            name: "",
            gender: "Female",
            age: "",
            phone: "+62",
            address: "",
            status: "AKTIF",
        });
        setValidationErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 p-5">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Add Customer
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-medium text-gray-900">
                                Customer Info
                            </h3>
                            <span className="text-red-500 text-sm font-medium">
                                *Required
                            </span>
                        </div>

                        {validationErrors.submit && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">
                                    {validationErrors.submit}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter Customer Name"
                                    value={customerForm.name}
                                    onChange={(e) =>
                                        handleChange("name", e.target.value)
                                    }
                                    className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                        validationErrors.name
                                            ? "ring-2 ring-red-500"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                />
                                {validationErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <Select
                                    value={customerForm.gender}
                                    onValueChange={(value) =>
                                        handleChange("gender", value)
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="Male">
                                            Male
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Enter Age Customer"
                                    value={customerForm.age}
                                    onChange={(e) =>
                                        handleChange("age", e.target.value)
                                    }
                                    className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                        validationErrors.age
                                            ? "ring-2 ring-red-500"
                                            : ""
                                    }`}
                                    min="1"
                                    max="150"
                                    disabled={isLoading}
                                />
                                {validationErrors.age && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.age}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="+62 8214646 5757"
                                    value={customerForm.phone}
                                    onChange={(e) =>
                                        handleChange("phone", e.target.value)
                                    }
                                    className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                        validationErrors.phone
                                            ? "ring-2 ring-red-500"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                />
                                {validationErrors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter Address"
                                    value={customerForm.address}
                                    onChange={(e) =>
                                        handleChange("address", e.target.value)
                                    }
                                    className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                        validationErrors.address
                                            ? "ring-2 ring-red-500"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                />
                                {validationErrors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {validationErrors.address}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <Select
                                    value={customerForm.status}
                                    onValueChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AKTIF">
                                            AKTIF
                                        </SelectItem>
                                        <SelectItem value="TIDAK AKTIF">
                                            TIDAK AKTIF
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !customerForm.name.trim()}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
