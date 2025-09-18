"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DoctorData {
    id: number;
    name: string;
    doctorId: string;
    phone: string;
    address: string;
}

interface AddDoctorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (doctor: DoctorData) => void;
}

export default function AddDoctorDialog({
    isOpen,
    onClose,
    onSubmit,
}: AddDoctorDialogProps) {
    const [doctorForm, setDoctorForm] = useState<DoctorData>({
        id: 0,
        name: "",
        doctorId: "",
        phone: "+62 ",
        address: "",
    });

    const handleChange = (field: keyof DoctorData, value: string) => {
        setDoctorForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        if (doctorForm.name.trim()) {
            onSubmit({
                ...doctorForm,
                id: Date.now(),
            });
            onClose();
            setDoctorForm({
                id: 0,
                name: "",
                doctorId: "",
                phone: "+62 ",
                address: "",
            });
        }
    };

    const handleClose = () => {
        onClose();
        setDoctorForm({
            id: 0,
            name: "",
            doctorId: "",
            phone: "+62 ",
            address: "",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Add Doctor
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter Doctor Name"
                                value={doctorForm.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Doctor ID
                            </label>
                            <Input
                                type="text"
                                placeholder="Doctor ID"
                                value={doctorForm.doctorId}
                                onChange={(e) =>
                                    handleChange("doctorId", e.target.value)
                                }
                                className="bg-gray-50 border-gray-200"
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
                                    handleChange("phone", e.target.value)
                                }
                                className="bg-gray-50 border-gray-200"
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
                                    handleChange("address", e.target.value)
                                }
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                    </div>
                </div>

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
                        disabled={!doctorForm.name.trim()}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
}
