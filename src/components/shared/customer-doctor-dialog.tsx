// components/shared/customer-doctor-dialog.tsx - COMPLETE FIXED VERSION
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Plus,
    User,
    Stethoscope,
    ArrowLeft,
    ChevronDown,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDoctor } from "@/hooks/useDoctor";
import { useCustomer } from "@/hooks/useCustomer";
import type { DoctorData } from "@/types/doctor";
import type { CustomerData as CustomerApiData } from "@/types/customer";
import { transformCustomerApiToForm } from "@/types/customer";

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
    const [isClient, setIsClient] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("both");
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

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
    const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
        id: 0,
        fullname: "",
        phone: "",
        address: "",
        fee_consultation: 0,
        sip: "",
    });

    // 🔥 FIX: Simplified dropdown states
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

    // 🔥 FIX: Simple refs for relative positioning
    const doctorContainerRef = useRef<HTMLDivElement>(null);
    const customerContainerRef = useRef<HTMLDivElement>(null);

    // ✅ Safe client-side initialization
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load doctors from API
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

    // Load customers from API
    const {
        customerList,
        isLoading: isCustomerLoading,
        error: customerError,
    } = useCustomer({
        limit: 100,
        offset: 0,
    });

    // Validation function
    const validateCustomerForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!customerForm.name.trim()) {
            errors.customerName = "Customer name is required";
        }

        if (
            customerForm.phone &&
            customerForm.phone !== "+62 " &&
            customerForm.phone.length < 10
        ) {
            errors.customerPhone = "Please enter a valid phone number";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle customer form changes
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

    // Handle customer selection from dropdown
    const handleCustomerSelect = (customer: CustomerApiData) => {
        setSelectedCustomerId(customer.kd_cust);
        const transformedCustomer = transformCustomerApiToForm(customer);
        setCustomerForm(transformedCustomer);
        setIsCustomerDropdownOpen(false);
        setCustomerSearch("");
        setValidationErrors({});
    };

    // Handle doctor selection from dropdown
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

    // Handle manual doctor form changes
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

    // 🔥 FIX: Simplified input handlers
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

    // Handle Customer button click
    const handleCustomerButtonClick = () => {
        setViewMode("customer-only");
        setCurrentFocus("customer");
    };

    // Handle Doctor button click
    const handleDoctorButtonClick = () => {
        setViewMode("doctor-only");
        setCurrentFocus("doctor");
    };

    // Handle back to both sections
    const handleBackToBoth = () => {
        setViewMode("both");
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!validateCustomerForm()) {
            return;
        }

        if (viewMode === "customer-only" && customerForm.name) {
            onSelectCustomer(customerForm);
            onClose();
        } else if (viewMode === "doctor-only" && doctorForm.fullname) {
            onSelectDoctor(doctorForm);
            onClose();
        } else if (viewMode === "both" && customerForm.name) {
            const doctorData = doctorForm.fullname ? doctorForm : undefined;
            onSubmit(customerForm, doctorData);
            onClose();
        }
    };

    // Handle close
    const handleClose = () => {
        onClose();
        // Reset all states
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
    };

    // Get dynamic dialog title
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

    // Check if form is valid for submission
    const isFormValid = () => {
        if (viewMode === "customer-only") {
            return customerForm.name.trim() !== "";
        } else if (viewMode === "doctor-only") {
            return doctorForm.fullname.trim() !== "";
        } else {
            return customerForm.name.trim() !== "";
        }
    };

    // 🔥 FIX: Close dropdown when clicking outside
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

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setCurrentFocus(initialFocus);
            setViewMode("both");
            setValidationErrors({});
        }
    }, [isOpen, initialFocus]);

    // Filter doctors and customers based on search
    const filteredDoctors = doctorList.filter((doctor) =>
        doctor.fullname.toLowerCase().includes(doctorSearch.toLowerCase())
    );

    const filteredCustomers = customerList.filter((customer) =>
        customer.nm_cust.toLowerCase().includes(customerSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300 p-5">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        {viewMode !== "both" && (
                            <button
                                onClick={handleBackToBoth}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Back to both sections"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                        )}
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {getDialogTitle()}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto space-y-6">
                    {/* Customer Info Card - MANDATORY */}
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
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Customer
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Full Name and Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {/* 🔥 FIX: Use relative positioning container */}
                                    <div
                                        className="relative"
                                        ref={customerContainerRef}
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Enter Customer Name or Search"
                                            value={customerForm.name}
                                            onChange={handleCustomerInputChange}
                                            onFocus={handleCustomerInputFocus}
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
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                                        >
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        </button>

                                        {/* 🔥 FIX: Simple relative dropdown */}
                                        {isCustomerDropdownOpen && isClient && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-2xl z-50 max-h-60 overflow-hidden">
                                                {/* Search Header */}
                                                <div className="p-2 border-b border-gray-100 bg-white sticky top-0">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search customers..."
                                                            value={
                                                                customerSearch
                                                            }
                                                            onChange={(e) =>
                                                                setCustomerSearch(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Customer List */}
                                                <div className="max-h-48 overflow-y-auto">
                                                    {isCustomerLoading ? (
                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            Loading customers...
                                                        </div>
                                                    ) : customerError ? (
                                                        <div className="px-3 py-2 text-sm text-red-500">
                                                            Error:{" "}
                                                            {customerError}
                                                        </div>
                                                    ) : filteredCustomers.length ===
                                                      0 ? (
                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            No customers found
                                                        </div>
                                                    ) : (
                                                        filteredCustomers.map(
                                                            (customer) => (
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
                                                                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
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

                                {/* Age and Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Age
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
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="+62 6214646 5757"
                                        value={customerForm.phone}
                                        onChange={(e) =>
                                            handleCustomerChange(
                                                "phone",
                                                e.target.value
                                            )
                                        }
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

                                {/* Address and Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
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
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
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

                    {/* Doctor Info Card - OPTIONAL */}
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
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Doctor
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Full Name and SIP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    {/* 🔥 FIX: Use relative positioning container */}
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
                                            className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDoctorDropdownOpen(
                                                    !isDoctorDropdownOpen
                                                )
                                            }
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                                        >
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        </button>

                                        {/* 🔥 FIX: Simple relative dropdown */}
                                        {isDoctorDropdownOpen && isClient && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-2xl z-50 max-h-60 overflow-hidden">
                                                {/* Search Header */}
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

                                                {/* Doctor List */}
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
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Phone Number and Address */}
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
                                        className="bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="px-6 bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-200"
                        disabled={!isFormValid()}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}
