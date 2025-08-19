// components/shared/customer-info-with-dialog.tsx - CORRECTED VERSION
"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

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

    const handleOpenCustomerDialog = () => {
        setDialogInitialFocus("customer");
        setIsDialogOpen(true);
    };

    const handleOpenDoctorDialog = () => {
        setDialogInitialFocus("doctor");
        setIsDialogOpen(true);
    };

    const handleCustomerSelect = (customer: CustomerData) => {
        if (onSelectCustomer) {
            onSelectCustomer(customer.name);
        }
    };

    const handleDoctorSelect = (doctor: DoctorData) => {
        if (onSelectDoctor) {
            onSelectDoctor(doctor.name);
        }
    };

    const handleSubmit = (
        customerData: CustomerData,
        doctorData: DoctorData
    ) => {
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
                <h2 className="text-lg font-semibold mb-2">
                    Customer Information
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600">
                            Customer Name
                        </label>
                        <Button
                            variant="outline"
                            className="w-full justify-between text-left"
                            onClick={handleOpenCustomerDialog}
                        >
                            {selectedCustomer || "Select Customer"}
                            <ChevronRight size={16} />
                        </Button>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">
                            Doctor Name
                        </label>
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
        </>
    );
}
