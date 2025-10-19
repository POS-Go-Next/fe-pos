"use client";

import { Button } from "@/components/ui/button";
import { useCustomer } from "@/hooks/useCustomer";
import { useDoctor } from "@/hooks/useDoctor";
import { showErrorAlert } from "@/lib/swal";
import type { CustomerData as CustomerApiData } from "@/types/customer";
import type { DoctorData } from "@/types/doctor";
import { X } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { CustomerSection } from "./customer-section";
import { DoctorSection } from "./doctor-section";

interface CustomerData {
    id: number;
    name: string;
    gender: string;
    age: string;
    phone: string;
    address: string;
    status: string;
}

interface DoctorFormData {
    id: number;
    fullname: string;
    phone: string;
    address: string;
    fee_consultation?: number;
    sip: string;
}

type DialogMode = "customer" | "doctor" | "both";
type ViewMode = "both" | "customer-only" | "doctor-only";

interface CustomerDoctorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCustomer: (customer: CustomerData) => void;
    onSelectDoctor: (doctor: DoctorFormData) => void;
    onSubmit: (customerData: CustomerData, doctorData?: DoctorFormData) => void;
    initialCustomer?: CustomerData;
    initialDoctor?: DoctorFormData;
    mode?: DialogMode;
    initialFocus?: "customer" | "doctor";
    triggerPaymentFlow?: boolean;
}

const DEFAULT_CUSTOMER_FORM: CustomerData = {
    id: 0,
    name: "",
    gender: "female",
    age: "",
    phone: "62",
    address: "",
    status: "true",
};

const DEFAULT_DOCTOR_FORM: DoctorFormData = {
    id: 0,
    fullname: "",
    phone: "",
    address: "",
    fee_consultation: 0,
    sip: "",
};

export default function CustomerDoctorDialog({
    isOpen,
    onClose,
    onSelectCustomer,
    onSelectDoctor,
    onSubmit,
    initialCustomer: _initialCustomer,
    initialDoctor: _initialDoctor,
    mode: _mode = "both",
    initialFocus = "customer",
    triggerPaymentFlow = false,
}: CustomerDoctorDialogProps) {
    const [_currentFocus, setCurrentFocus] = useState<"customer" | "doctor">(
        initialFocus
    );
    const [_isClient, setIsClient] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("both");
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
    const [customerForm, setCustomerForm] = useState<CustomerData>({
        ...DEFAULT_CUSTOMER_FORM,
    });
    const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
        ...DEFAULT_DOCTOR_FORM,
    });
    const [doctorSearch, setDoctorSearch] = useState("");
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
        null
    );
    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
        null
    );
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const {
        doctorList,
        isLoading: isDoctorLoading,
        error: doctorError,
        refetch: refetchDoctors,
    } = useDoctor({
        limit: 100,
        offset: 0,
        search: doctorSearch,
        sort_by: "id",
        sort_order: "desc",
    });

    const {
        customerList,
        isLoading: isCustomerLoading,
        error: customerError,
        refetch: refetchCustomers,
    } = useCustomer({
        limit: 100,
        offset: 0,
        search: customerSearch,
    });

    const resetAllFormData = useCallback(() => {
        setCustomerForm({ ...DEFAULT_CUSTOMER_FORM });
        setDoctorForm({ ...DEFAULT_DOCTOR_FORM });
        setCurrentFocus(initialFocus);
        setViewMode("both");
        setValidationErrors({});
        setSelectedDoctorId(null);
        setDoctorSearch("");
        setIsDoctorDropdownOpen(false);
        setSelectedCustomerId(null);
        setCustomerSearch("");
        setIsCustomerDropdownOpen(false);
        setIsCreatingCustomer(false);
        setIsCreatingDoctor(false);
    }, [initialFocus]);

    useEffect(() => {
        if (isOpen) {resetAllFormData();
        }
    }, [isOpen, initialFocus, resetAllFormData]);

    const validateCustomerForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!customerForm.name.trim()) {
            errors.customerName = "Customer name is required";
        }

        if (!customerForm.age && parseInt(customerForm.age) <= 0) {
            errors.customerAge = "Valid age is required";
        }

        if (
            !customerForm.phone ||
            customerForm.phone === "62" ||
            customerForm.phone.length < 10
        ) {
            errors.customerPhone = "Valid phone number is required";
        }

        if (!customerForm.address.trim()) {
            errors.customerAddress = "Address is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateDoctorForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!doctorForm.fullname.trim()) {
            errors.doctorFullname = "Doctor name is required";
        }

        if (!doctorForm.phone || doctorForm.phone.length < 10) {
            errors.doctorPhone = "Valid phone number is required";
        }

        if (!doctorForm.address.trim()) {
            errors.doctorAddress = "Address is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCustomerChange = (field: keyof CustomerData, value: string) => {
        setCustomerForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (
            validationErrors[
                `customer${field.charAt(0).toUpperCase() + field.slice(1)}`
            ]
        ) {
            setValidationErrors((prev) => ({
                ...prev,
                [`customer${field.charAt(0).toUpperCase() + field.slice(1)}`]:
                    "",
            }));
        }
    };

    const handleDoctorChange = (
        field: keyof DoctorFormData,
        value: string | number
    ) => {
        setDoctorForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (field === "fullname" && selectedDoctorId) {
            setSelectedDoctorId(null);
        }

        if (
            validationErrors[
                `doctor${field.charAt(0).toUpperCase() + field.slice(1)}`
            ]
        ) {
            setValidationErrors((prev) => ({
                ...prev,
                [`doctor${field.charAt(0).toUpperCase() + field.slice(1)}`]: "",
            }));
        }
    };

    const handleCustomerSelect = (customer: CustomerApiData) => {
        setSelectedCustomerId(customer.kd_cust);

        setCustomerForm({
            id: customer.kd_cust,
            name: customer.nm_cust,
            gender: customer.gender,
            age: customer.usia_cust?.toString(),
            phone: customer.telp_cust,
            address: customer.al_cust,
            status: customer.status ? "true" : "false",
        });

        setIsCustomerDropdownOpen(false);
        setCustomerSearch("");
        setValidationErrors({});
    };

    const handleDoctorSelect = (doctor: DoctorData) => {
        setSelectedDoctorId(doctor.id);
        setDoctorForm({
            id: doctor.id,
            fullname: doctor.fullname,
            phone: doctor.phone.toString(),
            address: doctor.address,
            fee_consultation: doctor.fee_consultation,
            sip: doctor.sip,
        });
        setIsDoctorDropdownOpen(false);
        setDoctorSearch("");
    };

    const handleDoctorInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        handleDoctorChange("fullname", value);
        setDoctorSearch(value);
        setIsDoctorDropdownOpen(true);
    };

    const handleCustomerInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        handleCustomerChange("name", value);
        setCustomerSearch(value);
        setIsCustomerDropdownOpen(true);
    };

    const handleDoctorInputFocus = () => {
        setIsDoctorDropdownOpen(true);
    };

    const handleCustomerInputFocus = () => {
        setIsCustomerDropdownOpen(true);
    };

    const handleCustomerButtonClick = () => {
        setViewMode("customer-only");
        setCurrentFocus("customer");
    };

    const handleDoctorButtonClick = () => {
        setViewMode("doctor-only");
        setCurrentFocus("doctor");
    };

    const handleBackToBoth = () => {
        setViewMode("both");
    };

    const handleCancel = () => {
        if (viewMode === "both") {
            handleClose();
        } else {
            handleBackToBoth();
        }
    };

    const createCustomerViaAPI = async (): Promise<CustomerData | null> => {
        try {
            setIsCreatingCustomer(true);

            const requestBody = {
                nm_cust: customerForm.name,
                usia_cust: parseInt(customerForm.age),
                gender: customerForm.gender,
                telp_cust: customerForm.phone,
                al_cust: customerForm.address,
                status: customerForm.status === "true",
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

            if (!data.success) {
                throw new Error(data.message || "Failed to create customer");
            }

            const createdCustomer: CustomerData = {
                id: data.data.kd_cust,
                name: data.data.nm_cust,
                gender: data.data.gender,
                age: data.data.usia_cust?.toString(),
                phone: data.data.telp_cust,
                address: data.data.al_cust,
                status: data.data.status ? "true" : "false",
            };

            if (refetchCustomers) {
                await refetchCustomers();
            }

            return createdCustomer;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create customer";
            await showErrorAlert("Error Creating Customer", errorMessage);
            return null;
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    const createDoctorViaAPI = async (): Promise<DoctorFormData | null> => {
        try {
            setIsCreatingDoctor(true);

            const requestBody = {
                fullname: doctorForm.fullname,
                phone: doctorForm.phone,
                address: doctorForm.address,
                sip: doctorForm.sip,
            };

            const response = await fetch("/api/doctor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create doctor");
            }

            if (!data.success) {
                throw new Error(data.message || "Failed to create doctor");
            }

            const createdDoctor: DoctorFormData = {
                id: data.data.id,
                fullname: data.data.fullname,
                phone: data.data.phone.toString(),
                address: data.data.address,
                fee_consultation: data.data.fee_consultation,
                sip: data.data.sip,
            };

            if (refetchDoctors) {
                await refetchDoctors();
            }

            return createdDoctor;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create doctor";
            await showErrorAlert("Error Creating Doctor", errorMessage);
            return null;
        } finally {
            setIsCreatingDoctor(false);
        }
    };

    const handleSubmit = async () => {
        if (viewMode === "customer-only" && customerForm.name) {
            if (!validateCustomerForm()) {
                return;
            }

            const createdCustomer = await createCustomerViaAPI();
            if (createdCustomer) {
                setCustomerForm(createdCustomer);
                setSelectedCustomerId(createdCustomer.id);
                setCustomerSearch("");
                setViewMode("both");
                onSelectCustomer(createdCustomer);
            }
        } else if (viewMode === "doctor-only" && doctorForm.fullname) {
            if (!validateDoctorForm()) {
                return;
            }

            const createdDoctor = await createDoctorViaAPI();
            if (createdDoctor) {
                setDoctorForm(createdDoctor);
                setSelectedDoctorId(createdDoctor.id);
                setDoctorSearch("");
                setViewMode("both");
                onSelectDoctor(createdDoctor);
            }

            if (!triggerPaymentFlow) {
                onClose();
            }
        } else if (viewMode === "both" && customerForm.name) {
            if (!validateCustomerForm()) {
                return;
            }

            let finalCustomerData = customerForm;

            if (!selectedCustomerId) {
                const createdCustomer = await createCustomerViaAPI();
                if (!createdCustomer) {
                    return;
                }
                finalCustomerData = createdCustomer;
            }

            let finalDoctorData = doctorForm.fullname ? doctorForm : undefined;

            if (doctorForm.fullname && !selectedDoctorId) {
                if (validateDoctorForm()) {
                    const createdDoctor = await createDoctorViaAPI();
                    if (createdDoctor) {
                        finalDoctorData = createdDoctor;
                    } else {
                        finalDoctorData = undefined;
                    }
                } else {
                    finalDoctorData = undefined;
                }
            }

            onSubmit(finalCustomerData, finalDoctorData);

            if (!triggerPaymentFlow) {
                onClose();
            }
        }
    };

    const handleClose = () => {resetAllFormData();
        onClose();
    };

    const getDialogTitle = () => {
        switch (viewMode) {
            case "customer-only":
                return "Add Customer";
            case "doctor-only":
                return "Add Doctor";
            default:
                return "Enter Customer and Doctor Data";
        }
    };

    const isFormValid = () => {
        if (viewMode === "customer-only") {
            return customerForm.name.trim() !== "";
        } else if (viewMode === "doctor-only") {
            return doctorForm.fullname.trim() !== "";
        } else {
            return customerForm.name.trim() !== "";
        }
    };

    const isSubmitLoading = isCreatingCustomer || isCreatingDoctor;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 p-5">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {getDialogTitle()}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto space-y-6">
                    <CustomerSection
                        customerForm={customerForm}
                        customerList={customerList}
                        selectedCustomerId={selectedCustomerId}
                        customerSearch={customerSearch}
                        isCustomerDropdownOpen={isCustomerDropdownOpen}
                        isCustomerLoading={isCustomerLoading}
                        customerError={customerError}
                        validationErrors={validationErrors}
                        viewMode={viewMode}
                        isSubmitLoading={isSubmitLoading}
                        onCustomerChange={handleCustomerChange}
                        onCustomerSelect={handleCustomerSelect}
                        onCustomerInputChange={handleCustomerInputChange}
                        onCustomerInputFocus={handleCustomerInputFocus}
                        onCustomerButtonClick={handleCustomerButtonClick}
                        setCustomerSearch={setCustomerSearch}
                        setIsCustomerDropdownOpen={setIsCustomerDropdownOpen}
                    />

                    <DoctorSection
                        doctorForm={doctorForm}
                        doctorList={doctorList}
                        selectedDoctorId={selectedDoctorId}
                        doctorSearch={doctorSearch}
                        isDoctorDropdownOpen={isDoctorDropdownOpen}
                        isDoctorLoading={isDoctorLoading}
                        doctorError={doctorError}
                        validationErrors={validationErrors}
                        viewMode={viewMode}
                        isSubmitLoading={isSubmitLoading}
                        onDoctorChange={handleDoctorChange}
                        onDoctorSelect={handleDoctorSelect}
                        onDoctorInputChange={handleDoctorInputChange}
                        onDoctorInputFocus={handleDoctorInputFocus}
                        onDoctorButtonClick={handleDoctorButtonClick}
                        setDoctorSearch={setDoctorSearch}
                        setIsDoctorDropdownOpen={setIsDoctorDropdownOpen}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitLoading}
                        className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-200"
                        disabled={!isFormValid() || isSubmitLoading}
                    >
                        {isSubmitLoading ? "Creating..." : "Submit"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
