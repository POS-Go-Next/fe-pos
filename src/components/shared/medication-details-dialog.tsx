"use client";

import { useMedicationDetail } from "@/hooks/useMedicationDetail";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface MedicationDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productCode?: string;
}

const MedicationDetailsDialog: React.FC<MedicationDetailsDialogProps> = ({
    isOpen,
    onClose,
    productName = "",
    productCode,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { medicationDetail, isLoading, error } = useMedicationDetail({
        kode_brg: productCode || null,
        enabled: isOpen && !!productCode,
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentImageIndex(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const productImages = medicationDetail?.product_images || [];
    const infoObat = medicationDetail?.info_obat || {};

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : productImages.length - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev < productImages.length - 1 ? prev + 1 : 0
        );
    };

    const medicationData = {
        description: infoObat.deskripsi || "Product description not available",
        sku: medicationDetail?.kode_brg || "-",
        productName: medicationDetail?.nama_brg || productName,
        packaging: infoObat.kemasan || "-",
        segmentation: infoObat.segmentasi || "Green",
        category: medicationDetail?.id_dept || "OTC",
        department: "Pharmacy",
        measurement: "-",
        prescription: infoObat.no_reg ? "Ya" : "Tidak",
        manufacturer: infoObat.nama_pabrik || "-",
        dosage: {
            dosis: infoObat.dosis || "Follow doctor's prescription",
            usage: infoObat.aturan_pakai || "Use as directed",
        },
        indications: infoObat.indikasi || "See product packaging",
        composition: infoObat.komposisi || "See product packaging",
        warnings: infoObat.peringatan || "Keep out of reach of children",
        contradiction: infoObat.kontraindikasi || "See product packaging",
        sideEffects: infoObat.efek_samping || "No known side effects",
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Medication Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">
                                Loading medication details...
                            </span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-red-500 mb-2">
                                    Error loading medication details
                                </p>
                                <p className="text-sm text-gray-600">{error}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="rounded-lg border border-gray-200">
                                    <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                                        <h3 className="text-blue-600 font-medium text-center">
                                            Product Image
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-b-lg p-4">
                                        <div className="relative bg-gray-100 rounded-lg p-4 border-2 border-blue-400">
                                            {productImages.length > 0 ? (
                                                <>
                                                    <Image
                                                        src={
                                                            productImages[
                                                                currentImageIndex
                                                            ]?.url ||
                                                            productImages[
                                                                currentImageIndex
                                                            ]?.gambar
                                                        }
                                                        alt={productName || "Product image"}
                                                        width={400}
                                                        height={192}
                                                        className="w-full h-48 object-contain rounded"
                                                        onError={(e) => {
                                                            console.error(
                                                                "Image load error:",
                                                                e
                                                            );
                                                            e.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                    {productImages.length >
                                                        1 && (
                                                        <>
                                                            <button
                                                                onClick={
                                                                    handlePrevImage
                                                                }
                                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow hover:shadow-lg transition-shadow"
                                                            >
                                                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                            <button
                                                                onClick={
                                                                    handleNextImage
                                                                }
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow hover:shadow-lg transition-shadow"
                                                            >
                                                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                                                {productImages.map(
                                                                    (
                                                                        _,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                                                index ===
                                                                                currentImageIndex
                                                                                    ? "bg-blue-600"
                                                                                    : "bg-gray-300"
                                                                            }`}
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full h-48 flex items-center justify-center text-gray-400">
                                                    <div className="text-center">
                                                        <svg
                                                            className="w-16 h-16 mx-auto mb-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <p className="text-sm">
                                                            No image available
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200">
                                    <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                                        <h3 className="text-blue-600 font-medium text-center">
                                            Description
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-b-lg p-4">
                                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                            {medicationData.description}
                                        </p>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    SKU
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {medicationData.sku}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Product Name
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {medicationData.productName}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Packaging
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {medicationData.packaging}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Segmentation
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {
                                                        medicationData.segmentation
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Category
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {medicationData.category}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Department
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {medicationData.department}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Measurement
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {medicationData.measurement}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Prescription (Resep)
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {
                                                        medicationData.prescription
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex">
                                                <span className="text-gray-600 w-32">
                                                    Manufacturer
                                                </span>
                                                <span className="text-gray-600 mx-2">
                                                    :
                                                </span>
                                                <span className="text-gray-900">
                                                    {
                                                        medicationData.manufacturer
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-lg border border-gray-200">
                                    <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                                        <h3 className="text-blue-600 font-medium text-center">
                                            Dosage & Usage Instructions
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-b-lg p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            💊
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Dosage (Dosis)
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {
                                                        medicationData.dosage
                                                            .dosis
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            📋
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Usage Instructions
                                                        (Aturan Pakai)
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {
                                                        medicationData.dosage
                                                            .usage
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200">
                                    <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                                        <h3 className="text-blue-600 font-medium text-center">
                                            Indications, Composition & Warnings
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-b-lg p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            🎯
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Indications
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {medicationData.indications}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            🧪
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Composition
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {medicationData.composition}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            ⚠️
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Warnings
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {medicationData.warnings}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200">
                                    <div className="bg-blue-100 rounded-t-lg px-4 py-3">
                                        <h3 className="text-blue-600 font-medium text-center">
                                            Contradiction & Side Effects
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-b-lg p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            🚫
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Contradiction
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {
                                                        medicationData.contradiction
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                                                        <span className="text-white text-xs">
                                                            ⚡
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        Side Effects
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {medicationData.sideEffects}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicationDetailsDialog;
