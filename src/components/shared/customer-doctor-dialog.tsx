// components/shared/customer-doctor-dialog.tsx - FIXED FLOW INTEGRATION
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCustomer } from "@/hooks/useCustomer";
import { useDoctor } from "@/hooks/useDoctor";
import type { CustomerData as CustomerApiData } from "@/types/customer";
import { transformCustomerApiToForm } from "@/types/customer";
import type { DoctorData } from "@/types/doctor";
import { ChevronDown, Plus, Search, Stethoscope, User, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
    // 🔥 NEW: Add support for direct payment flow
    triggerPaymentFlow?: boolean;
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
    triggerPaymentFlow = false, // 🔥 NEW: Flag to trigger payment flow
}: CustomerDoctorDialogProps) {
    const [currentFocus, setCurrentFocus] = useState<"customer" | "doctor">(
        initialFocus
    );
    const [isClient, setIsClient] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("both");
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    const [customerForm, setCustomerForm] = useState<CustomerData>({
        id: 0,
        name: "",
        gender: "female",
        age: "",
        phone: "62",
        address: "",
        status: "true",
    });

    const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
        id: 0,
        fullname: "",
        phone: "",
        address: "",
        fee_consultation: 0,
        sip: "",
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

    const doctorContainerRef = useRef<HTMLDivElement>(null);
    const customerContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const {
        doctorList,
        isLoading: isDoctorLoading,
        error: doctorError,
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

    const validateCustomerForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!customerForm.name.trim()) {
            errors.customerName = "Customer name is required";
        }

        if (!customerForm.age || parseInt(customerForm.age) <= 0) {
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

    const handleCustomerSelect = (customer: CustomerApiData) => {
        setSelectedCustomerId(customer.kd_cust);
        const transformedCustomer = transformCustomerApiToForm(customer);
        setCustomerForm(transformedCustomer);
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
            console.log("🌐 Starting API call to create customer");
            setIsCreatingCustomer(true);

            const requestBody = {
                nm_cust: customerForm.name,
                usia_cust: parseInt(customerForm.age),
                gender: customerForm.gender,
                telp_cust: customerForm.phone,
                al_cust: customerForm.address,
                status: customerForm.status === "true",
            };

            console.log("📤 Request body:", requestBody);

            const response = await fetch("/api/customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            console.log("🔥 Response status:", response.status);
            const data = await response.json();
            console.log("🔥 Response data:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to create customer");
            }

            const createdCustomer: CustomerData = {
                id: data.data.kd_cust,
                name: data.data.nm_cust,
                gender: data.data.gender,
                age: data.data.usia_cust.toString(),
                phone: data.data.telp_cust,
                address: data.data.al_cust,
                status: data.data.status ? "true" : "false",
            };

            console.log("✅ Customer created successfully:", createdCustomer);

            if (refetchCustomers) {
                console.log("🔄 Refreshing customer list...");
                refetchCustomers();
            }

            return createdCustomer;
        } catch (error) {
            console.error("❌ Error creating customer:", error);
            setValidationErrors({
                submit:
                    error instanceof Error
                        ? error.message
                        : "Failed to create customer",
            });
            return null;
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    // 🔥 FIXED: Handle submit with proper flow integration
    const handleSubmit = async () => {
        console.log("🚀 Submit button clicked!");
        console.log("Current form data:", customerForm);
        console.log("View mode:", viewMode);
        console.log("Selected customer ID:", selectedCustomerId);
        console.log("Trigger payment flow:", triggerPaymentFlow); // 🔥 NEW

        if (!validateCustomerForm()) {
            console.log("❌ Form validation failed");
            return;
        }

        console.log("✅ Form validation passed");

        if (viewMode === "customer-only" && customerForm.name) {
            console.log(
                "🏪 Creating new customer via API (customer-only mode)..."
            );
            const createdCustomer = await createCustomerViaAPI();
            if (createdCustomer) {
                console.log(
                    "✅ Customer created successfully:",
                    createdCustomer
                );
                onSelectCustomer(createdCustomer);

                // 🔥 FIXED: Don't close dialog if triggerPaymentFlow is true
                if (!triggerPaymentFlow) {
                    onClose();
                }
            } else {
                console.log("❌ Customer creation failed");
            }
        } else if (viewMode === "doctor-only" && doctorForm.fullname) {
            console.log("👨‍⚕️ Submitting doctor data");
            onSelectDoctor(doctorForm);

            // 🔥 FIXED: Don't close dialog if triggerPaymentFlow is true
            if (!triggerPaymentFlow) {
                onClose();
            }
        } else if (viewMode === "both" && customerForm.name) {
            console.log("👥 Submitting both customer and doctor data");
            let finalCustomerData = customerForm;

            // Check if this is a new customer (not selected from existing list)
            if (!selectedCustomerId) {
                console.log("🏪 Creating new customer via API (both mode)...");
                const createdCustomer = await createCustomerViaAPI();
                if (!createdCustomer) {
                    console.log(
                        "❌ Customer creation failed, stopping submission"
                    );
                    return;
                }
                console.log(
                    "✅ Customer created successfully:",
                    createdCustomer
                );
                finalCustomerData = createdCustomer;
            } else {
                console.log("📄 Using existing customer from selection");
            }

            const doctorData = doctorForm.fullname ? doctorForm : undefined;

            // 🔥 FIXED: Call onSubmit with both customer and doctor data
            // This will trigger the payment flow in the parent component
            onSubmit(finalCustomerData, doctorData);

            // 🔥 FIXED: Only close if not triggering payment flow
            if (!triggerPaymentFlow) {
                onClose();
            }
        }
    };

    const handleClose = () => {
        onClose();
        setCustomerForm({
            id: 0,
            name: "",
            gender: "female",
            age: "",
            phone: "62",
            address: "",
            status: "true",
        });
        setDoctorForm({
            id: 0,
            fullname: "",
            phone: "",
            address: "",
            fee_consultation: 0,
            sip: "",
        });
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

    const isSubmitLoading = isCreatingCustomer;

    useEffect(() => {
        if (!isClient) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                doctorContainerRef.current &&
                !doctorContainerRef.current.contains(target)
            ) {
                setIsDoctorDropdownOpen(false);
            }

            if (
                customerContainerRef.current &&
                !customerContainerRef.current.contains(target)
            ) {
                setIsCustomerDropdownOpen(false);
            }
        };

        if (isDoctorDropdownOpen || isCustomerDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isDoctorDropdownOpen, isCustomerDropdownOpen, isClient]);

    useEffect(() => {
        if (isOpen) {
            setCurrentFocus(initialFocus);
            setViewMode("both");
            setValidationErrors({});
        }
    }, [isOpen, initialFocus]);

    const filteredDoctors = doctorList.filter((doctor) =>
        doctor.fullname.toLowerCase().includes(doctorSearch.toLowerCase())
    );

    const filteredCustomers = customerList;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 p-5">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {getDialogTitle()}
                        </h2>
                        {triggerPaymentFlow && (
                            <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Payment Flow
                            </span>
                        )}
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
                    {/* Customer Info Section - Same as before */}
                    <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                            viewMode === "doctor-only"
                                ? "max-h-0 opacity-0 pointer-events-none"
                                : "max-h-[2000px] opacity-100"
                        }`}
                    >
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-600" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Customer Info
                                    </h3>
                                    <span className="text-red-500 text-sm font-medium">
                                        *Required
                                    </span>
                                </div>
                                {viewMode === "both" && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                                        onClick={handleCustomerButtonClick}
                                        disabled={isSubmitLoading}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Customer
                                    </Button>
                                )}
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
                                    {viewMode === "customer-only" ? (
                                        <Input
                                            type="text"
                                            placeholder="Enter Customer Name"
                                            value={customerForm.name}
                                            onChange={(e) =>
                                                handleCustomerChange(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            disabled={isSubmitLoading}
                                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                                validationErrors.customerName
                                                    ? "ring-2 ring-red-500"
                                                    : ""
                                            }`}
                                        />
                                    ) : (
                                        <div
                                            className="relative"
                                            ref={customerContainerRef}
                                        >
                                            <Input
                                                type="text"
                                                placeholder="Enter Customer Name or Search"
                                                value={customerForm.name}
                                                onChange={
                                                    handleCustomerInputChange
                                                }
                                                onFocus={
                                                    handleCustomerInputFocus
                                                }
                                                disabled={isSubmitLoading}
                                                className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10 ${
                                                    validationErrors.customerName
                                                        ? "ring-2 ring-red-500"
                                                        : ""
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsCustomerDropdownOpen(
                                                        !isCustomerDropdownOpen
                                                    )
                                                }
                                                disabled={isSubmitLoading}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                            >
                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                            </button>

                                            {isCustomerDropdownOpen &&
                                                isClient && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-2xl z-50 max-h-60 overflow-hidden">
                                                        <div className="p-2 border-b border-gray-100 bg-white sticky top-0">
                                                            <div className="relative">
                                                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search customers..."
                                                                    value={
                                                                        customerSearch
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setCustomerSearch(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="max-h-48 overflow-y-auto">
                                                            {isCustomerLoading ? (
                                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                                    Loading
                                                                    customers...
                                                                </div>
                                                            ) : customerError ? (
                                                                <div className="px-3 py-2 text-sm text-red-500">
                                                                    Error:{" "}
                                                                    {
                                                                        customerError
                                                                    }
                                                                </div>
                                                            ) : filteredCustomers.length ===
                                                              0 ? (
                                                                <div className="px-3 py-2 text-sm text-gray-500">
                                                                    No customers
                                                                    found
                                                                </div>
                                                            ) : (
                                                                filteredCustomers.map(
                                                                    (
                                                                        customer
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                customer.kd_cust
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleCustomerSelect(
                                                                                    customer
                                                                                )
                                                                            }
                                                                            className={`w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0 transition-colors ${
                                                                                selectedCustomerId ===
                                                                                customer.kd_cust
                                                                                    ? "bg-blue-50 text-blue-600"
                                                                                    : "text-gray-900"
                                                                            }`}
                                                                        >
                                                                            <div className="text-sm font-medium">
                                                                                {
                                                                                    customer.nm_cust
                                                                                }
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {customer.gender ===
                                                                                "male"
                                                                                    ? "Male"
                                                                                    : "Female"}{" "}
                                                                                •{" "}
                                                                                {
                                                                                    customer.usia_cust
                                                                                }{" "}
                                                                                years
                                                                                old
                                                                            </div>
                                                                        </button>
                                                                    )
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                    {validationErrors.customerName && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {validationErrors.customerName}
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
                                            handleCustomerChange(
                                                "gender",
                                                value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                    >
                                        <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Age{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter Age Customer"
                                        value={customerForm.age}
                                        onChange={(e) =>
                                            handleCustomerChange(
                                                "age",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                        className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                            validationErrors.customerAge
                                                ? "ring-2 ring-red-500"
                                                : ""
                                        }`}
                                    />
                                    {validationErrors.customerAge && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {validationErrors.customerAge}
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
                                        placeholder="628214646757"
                                        value={customerForm.phone}
                                        onChange={(e) =>
                                            handleCustomerChange(
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                        className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                            validationErrors.customerPhone
                                                ? "ring-2 ring-red-500"
                                                : ""
                                        }`}
                                    />
                                    {validationErrors.customerPhone && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {validationErrors.customerPhone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter Address"
                                        value={customerForm.address}
                                        onChange={(e) =>
                                            handleCustomerChange(
                                                "address",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                        className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                            validationErrors.customerAddress
                                                ? "ring-2 ring-red-500"
                                                : ""
                                        }`}
                                    />
                                    {validationErrors.customerAddress && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {validationErrors.customerAddress}
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
                                            handleCustomerChange(
                                                "status",
                                                value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                    >
                                        <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">
                                                AKTIF
                                            </SelectItem>
                                            <SelectItem value="false">
                                                TIDAK AKTIF
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Info Section - Same as before */}
                    <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                            viewMode === "customer-only"
                                ? "max-h-0 opacity-0 pointer-events-none"
                                : "max-h-[2000px] opacity-100"
                        }`}
                    >
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-gray-600" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Doctor Info
                                    </h3>
                                    <span className="text-gray-500 text-sm font-medium">
                                        Optional
                                    </span>
                                </div>
                                {viewMode === "both" && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                                        onClick={handleDoctorButtonClick}
                                        disabled={isSubmitLoading}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Doctor
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div
                                        className="relative"
                                        ref={doctorContainerRef}
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Enter Doctor Name or Search"
                                            value={doctorForm.fullname}
                                            onChange={handleDoctorInputChange}
                                            onFocus={handleDoctorInputFocus}
                                            disabled={isSubmitLoading}
                                            className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDoctorDropdownOpen(
                                                    !isDoctorDropdownOpen
                                                )
                                            }
                                            disabled={isSubmitLoading}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                        >
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        </button>

                                        {isDoctorDropdownOpen && isClient && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-2xl z-50 max-h-60 overflow-hidden">
                                                <div className="p-2 border-b border-gray-100 bg-white sticky top-0">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search doctors..."
                                                            value={doctorSearch}
                                                            onChange={(e) =>
                                                                setDoctorSearch(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-48 overflow-y-auto">
                                                    {isDoctorLoading ? (
                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            Loading doctors...
                                                        </div>
                                                    ) : doctorError ? (
                                                        <div className="px-3 py-2 text-sm text-red-500">
                                                            Error: {doctorError}
                                                        </div>
                                                    ) : filteredDoctors.length ===
                                                      0 ? (
                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            No doctors found
                                                        </div>
                                                    ) : (
                                                        filteredDoctors.map(
                                                            (doctor) => (
                                                                <button
                                                                    key={
                                                                        doctor.id
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDoctorSelect(
                                                                            doctor
                                                                        )
                                                                    }
                                                                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                                                                        selectedDoctorId ===
                                                                        doctor.id
                                                                            ? "bg-blue-50 text-blue-600"
                                                                            : "text-gray-900"
                                                                    }`}
                                                                >
                                                                    <div className="text-sm font-medium">
                                                                        {
                                                                            doctor.fullname
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {
                                                                            doctor.sip
                                                                        }
                                                                    </div>
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SIP
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Doctor SIP"
                                        value={doctorForm.sip}
                                        onChange={(e) =>
                                            handleDoctorChange(
                                                "sip",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="+62 8214646 5757"
                                        value={doctorForm.phone}
                                        onChange={(e) =>
                                            handleDoctorChange(
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Doctor Address"
                                        value={doctorForm.address}
                                        onChange={(e) =>
                                            handleDoctorChange(
                                                "address",
                                                e.target.value
                                            )
                                        }
                                        disabled={isSubmitLoading}
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
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
