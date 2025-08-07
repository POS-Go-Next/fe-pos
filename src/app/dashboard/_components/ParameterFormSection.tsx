// app/dashboard/_components/ParameterFormSection.tsx
"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { FC } from "react";

interface ParameterFormData {
    namaCabang: string;
    namaCabangText?: string;
    namaArea: string;
    namaAreaText?: string;
    lokasiDepo: string;
    lokasiSatelit: string;
    cabangBaru: string;
    rsia: string;
    barangTransit: string;
    sc: string;
    scDoctor: string;
    ruResep: string;
    ruSwalayan: string;
    shift1Start: string;
    shift1End: string;
    shift2Start: string;
    shift2End: string;
    shift3Start: string;
    shift3End: string;
    toleransiWaktuMin: string;
    toleransiWaktuMax: string;
}

interface CabangOption {
    value: string;
    label: string;
}

interface AreaOption {
    value: string;
    label: string;
}

interface ParameterFormSectionProps {
    formData: ParameterFormData;
    cabangOptions: CabangOption[];
    areaOptions: AreaOption[];
    isLoadingCabang: boolean;
    isLoadingArea: boolean;
    cabangError: string | null;
    areaError: string | null;
    isSubmitting: boolean;
    onInputChange: (field: keyof ParameterFormData, value: string) => void;
    onCabangChange: (kdCabang: string) => void;
    onAreaChange: (idArea: string) => void;
}

const ParameterFormSection: FC<ParameterFormSectionProps> = ({
    formData,
    cabangOptions,
    areaOptions,
    isLoadingCabang,
    isLoadingArea,
    cabangError,
    areaError,
    isSubmitting,
    onInputChange,
    onCabangChange,
    onAreaChange,
}) => {
    return (
        <div className="space-y-6">
            {/* Cabang & Area Section */}
            <div className="bg-white border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Cabang
                        </label>
                        <Combobox
                            options={cabangOptions}
                            value={formData.namaCabang}
                            onValueChange={onCabangChange}
                            placeholder={
                                isLoadingCabang
                                    ? "Loading cabang..."
                                    : cabangError
                                    ? "Error loading data"
                                    : "Pilih Cabang"
                            }
                            searchPlaceholder="Cari cabang..."
                            emptyText="Cabang tidak ditemukan"
                            disabled={isLoadingCabang || isSubmitting}
                            loading={isLoadingCabang}
                            className="w-full h-[52px]"
                            displayValue={formData.namaCabangText}
                            truncateAt={25}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Area
                        </label>
                        <Combobox
                            options={areaOptions}
                            value={formData.namaArea}
                            onValueChange={onAreaChange}
                            placeholder={
                                isLoadingArea
                                    ? "Loading area..."
                                    : areaError
                                    ? "Error loading data"
                                    : "Pilih Area"
                            }
                            searchPlaceholder="Cari area..."
                            emptyText="Area tidak ditemukan"
                            disabled={isLoadingArea || isSubmitting}
                            loading={isLoadingArea}
                            className="w-full h-[52px]"
                            displayValue={formData.namaAreaText}
                            truncateAt={25}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lokasi Depo
                        </label>
                        <Input
                            value={formData.lokasiDepo}
                            onChange={(e) =>
                                onInputChange("lokasiDepo", e.target.value)
                            }
                            className="bg-[#F5F5F5] border-none h-[52px]"
                            placeholder="Kode Depo"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lokasi Satelit
                        </label>
                        <Input
                            value={formData.lokasiSatelit}
                            onChange={(e) =>
                                onInputChange("lokasiSatelit", e.target.value)
                            }
                            className="bg-[#F5F5F5] border-none h-[52px]"
                            placeholder="Kode Satelit"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cabang Baru
                        </label>
                        <Select
                            value={formData.cabangBaru}
                            onValueChange={(value) =>
                                onInputChange("cabangBaru", value)
                            }
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tidak">Tidak</SelectItem>
                                <SelectItem value="Ya">Ya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            RSIA
                        </label>
                        <Select
                            value={formData.rsia}
                            onValueChange={(value) =>
                                onInputChange("rsia", value)
                            }
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tidak">Tidak</SelectItem>
                                <SelectItem value="Ya">Ya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Barang Transit
                        </label>
                        <Select
                            value={formData.barangTransit}
                            onValueChange={(value) =>
                                onInputChange("barangTransit", value)
                            }
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="bg-[#F5F5F5] border-none h-[52px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tidak">Tidak</SelectItem>
                                <SelectItem value="Ya">Ya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* SC Values Section */}
            <div className="bg-white border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SC
                        </label>
                        <Input
                            value={formData.sc}
                            onChange={(e) =>
                                onInputChange("sc", e.target.value)
                            }
                            className="bg-[#F5F5F5] border-none h-[52px]"
                            type="number"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SC Doctor
                        </label>
                        <Input
                            value={formData.scDoctor}
                            onChange={(e) =>
                                onInputChange("scDoctor", e.target.value)
                            }
                            className="bg-[#F5F5F5] border-none h-[52px]"
                            type="number"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            RU Resep
                        </label>
                        <Input
                            value={formData.ruResep}
                            onChange={(e) =>
                                onInputChange("ruResep", e.target.value)
                            }
                            className="bg-[#F5F5F5] border-none h-[52px]"
                            type="number"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            RU Swalayan
                        </label>
                        <Input
                            value={formData.ruSwalayan}
                            onChange={(e) =>
                                onInputChange("ruSwalayan", e.target.value)
                            }
                            className="bg-[#F5F5F5] border-none h-[52px]"
                            type="number"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            {/* Shift Times Section */}
            <div className="bg-white border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shift 1
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                value={formData.shift1Start}
                                onChange={(e) =>
                                    onInputChange("shift1Start", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                            <span>-</span>
                            <Input
                                type="time"
                                value={formData.shift1End}
                                onChange={(e) =>
                                    onInputChange("shift1End", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shift 2
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                value={formData.shift2Start}
                                onChange={(e) =>
                                    onInputChange("shift2Start", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                            <span>-</span>
                            <Input
                                type="time"
                                value={formData.shift2End}
                                onChange={(e) =>
                                    onInputChange("shift2End", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shift 3
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                value={formData.shift3Start}
                                onChange={(e) =>
                                    onInputChange("shift3Start", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                            <span>-</span>
                            <Input
                                type="time"
                                value={formData.shift3End}
                                onChange={(e) =>
                                    onInputChange("shift3End", e.target.value)
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Toleransi Waktu (min)
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={formData.toleransiWaktuMin}
                                onChange={(e) =>
                                    onInputChange(
                                        "toleransiWaktuMin",
                                        e.target.value
                                    )
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                type="number"
                                disabled={isSubmitting}
                            />
                            <span>-</span>
                            <Input
                                value={formData.toleransiWaktuMax}
                                onChange={(e) =>
                                    onInputChange(
                                        "toleransiWaktuMax",
                                        e.target.value
                                    )
                                }
                                className="bg-[#F5F5F5] border-none h-[52px]"
                                type="number"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParameterFormSection;
