"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Plus, Search, Stethoscope } from "lucide-react";
import { DropdownPortal } from "./dropdown-portal";
import type { DoctorData } from "@/types/doctor";

interface DoctorFormData {
    id: number;
    fullname: string;
    phone: string;
    address: string;
    fee_consultation?: number;
    sip: string;
}

interface DoctorSectionProps {
    doctorForm: DoctorFormData;
    doctorList: DoctorData[];
    selectedDoctorId: number | null;
    doctorSearch: string;
    isDoctorDropdownOpen: boolean;
    isDoctorLoading: boolean;
    doctorError: string | null;
    validationErrors: Record<string, string>;
    viewMode: "both" | "customer-only" | "doctor-only";
    isSubmitLoading: boolean;
    onDoctorChange: (
        field: keyof DoctorFormData,
        value: string | number
    ) => void;
    onDoctorSelect: (doctor: DoctorData) => void;
    onDoctorInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDoctorInputFocus: () => void;
    onDoctorButtonClick: () => void;
    setDoctorSearch: (value: string) => void;
    setIsDoctorDropdownOpen: (open: boolean) => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({
    doctorForm,
    doctorList,
    selectedDoctorId,
    doctorSearch,
    isDoctorDropdownOpen,
    isDoctorLoading,
    doctorError,
    validationErrors,
    viewMode,
    isSubmitLoading,
    onDoctorChange,
    onDoctorSelect,
    onDoctorInputChange,
    onDoctorInputFocus,
    onDoctorButtonClick,
    setDoctorSearch,
    setIsDoctorDropdownOpen,
}) => {
    const doctorContainerRef = useRef<HTMLDivElement>(null);

    const filteredDoctors = doctorList.filter((doctor) =>
        doctor.fullname.toLowerCase().includes(doctorSearch.toLowerCase())
    );

    return (
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
                            {viewMode === "doctor-only"
                                ? "*Required"
                                : "Optional"}
                        </span>
                    </div>
                    {viewMode === "both" && (
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                            onClick={onDoctorButtonClick}
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
                            {viewMode === "doctor-only" && (
                                <span className="text-red-500"> *</span>
                            )}
                        </label>
                        {viewMode === "doctor-only" ? (
                            <Input
                                type="text"
                                placeholder="Enter Doctor Name"
                                value={doctorForm.fullname}
                                onChange={(e) =>
                                    onDoctorChange("fullname", e.target.value)
                                }
                                disabled={isSubmitLoading}
                                className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                    validationErrors.doctorFullname
                                        ? "ring-2 ring-red-500"
                                        : ""
                                }`}
                            />
                        ) : (
                            <div className="relative" ref={doctorContainerRef}>
                                <Input
                                    type="text"
                                    placeholder="Enter Doctor Name or Search"
                                    value={doctorForm.fullname}
                                    onChange={onDoctorInputChange}
                                    onFocus={onDoctorInputFocus}
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

                                <DropdownPortal
                                    isOpen={isDoctorDropdownOpen}
                                    triggerRef={doctorContainerRef}
                                    onClose={() =>
                                        setIsDoctorDropdownOpen(false)
                                    }
                                >
                                    <div className="p-2 border-b border-gray-100 bg-white sticky top-0">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search doctors..."
                                                value={doctorSearch}
                                                onChange={(e) =>
                                                    setDoctorSearch(
                                                        e.target.value
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
                                        ) : filteredDoctors.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No doctors found
                                            </div>
                                        ) : (
                                            filteredDoctors.map((doctor) => (
                                                <button
                                                    key={doctor.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onDoctorSelect(doctor);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                                                        selectedDoctorId ===
                                                        doctor.id
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "text-gray-900"
                                                    }`}
                                                >
                                                    <div className="text-sm font-medium">
                                                        {doctor.fullname}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {doctor.sip}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </DropdownPortal>
                            </div>
                        )}
                        {validationErrors.doctorFullname && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.doctorFullname}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SIP
                            {viewMode === "doctor-only" && (
                                <span className="text-red-500"> *</span>
                            )}
                        </label>
                        <Input
                            type="text"
                            placeholder="Doctor SIP"
                            value={doctorForm.sip}
                            onChange={(e) =>
                                onDoctorChange("sip", e.target.value)
                            }
                            disabled={isSubmitLoading}
                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                validationErrors.doctorSip
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        />
                        {validationErrors.doctorSip && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.doctorSip}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                            {viewMode === "doctor-only" && (
                                <span className="text-red-500"> *</span>
                            )}
                        </label>
                        <Input
                            type="text"
                            placeholder="+62 8214646 5757"
                            value={doctorForm.phone}
                            onChange={(e) =>
                                onDoctorChange("phone", e.target.value)
                            }
                            disabled={isSubmitLoading}
                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                validationErrors.doctorPhone
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        />
                        {validationErrors.doctorPhone && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.doctorPhone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                            {viewMode === "doctor-only" && (
                                <span className="text-red-500"> *</span>
                            )}
                        </label>
                        <Input
                            type="text"
                            placeholder="Doctor Address"
                            value={doctorForm.address}
                            onChange={(e) =>
                                onDoctorChange("address", e.target.value)
                            }
                            disabled={isSubmitLoading}
                            className={`bg-[#F5F5F5] border-none h-[52px] focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                                validationErrors.doctorAddress
                                    ? "ring-2 ring-red-500"
                                    : ""
                            }`}
                        />
                        {validationErrors.doctorAddress && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.doctorAddress}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
