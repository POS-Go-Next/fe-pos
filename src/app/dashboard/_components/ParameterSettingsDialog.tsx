// app/dashboard/_components/ParameterSettingsDialog.tsx - FIXED VERSION
"use client";

import { FC, useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCabang } from "@/hooks/useCabang";
import { useArea } from "@/hooks/useArea";
import { useParameter } from "@/hooks/useParameter";
import { useAuth } from "@/hooks/useAuth";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import ParameterFormSection from "./ParameterFormSection";
import ParameterReceiptSection from "./ParameterReceiptSection";
import ParameterReceiptPreview from "./ParameterReceiptPreview";
import Swal from "sweetalert2";

interface ParameterSettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ParameterFormData) => void;
}

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
    receiptType: "header" | "footer";
    header1: string;
    header2: string;
    header3: string;
    header4: string;
    header5: string;
    footer1: string;
    footer2: string;
    footer3: string;
    footer4: string;
}

const ParameterSettingsDialog: FC<ParameterSettingsDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [shouldShowInterface, setShouldShowInterface] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReceiptPreview, setShowReceiptPreview] = useState(false);

    const { logout } = useAuth();

    const {
        parameterData,
        isLoading: isLoadingParameter,
        error: parameterError,
        refetch: refetchParameter,
        updateParameter,
    } = useParameter();

    const {
        cabangList,
        isLoading: isLoadingCabang,
        error: cabangError,
        refetch: refetchCabang,
    } = useCabang({
        limit: 50,
        offset: 0,
    });

    const {
        areaList,
        isLoading: isLoadingArea,
        error: areaError,
        refetch: refetchArea,
    } = useArea({
        limit: 50,
        offset: 0,
    });

    const cabangOptions = cabangList.map((cabang) => ({
        value: cabang.kd_cabang,
        label: cabang.nama_cabang,
    }));

    const areaOptions = areaList.map((area) => ({
        value: area.id_area,
        label: area.nama_area,
    }));

    const [formData, setFormData] = useState<ParameterFormData>({
        namaCabang: "",
        namaArea: "",
        lokasiDepo: "",
        lokasiSatelit: "",
        cabangBaru: "Tidak",
        rsia: "Tidak",
        barangTransit: "Tidak",
        sc: "0",
        scDoctor: "0",
        ruResep: "0",
        ruSwalayan: "0",
        shift1Start: "07:00:00",
        shift1End: "14:29:00",
        shift2Start: "14:30:00",
        shift2End: "21:59:00",
        shift3Start: "22:00:00",
        shift3End: "07:00:00",
        toleransiWaktuMin: "30",
        toleransiWaktuMax: "120",
        receiptType: "header",
        header1: "APOTEK ROXY",
        header2: "Jl. Blak NO.39 (BUKA 24 JAM)",
        header3: "TELP(021) 6318066 - WA. 08111002021",
        header4: "www.apotekroxy.com",
        header5: "Email - outlet001@apotekroxy.com",
        footer1: "",
        footer2: "",
        footer3: "",
        footer4: "",
    });

    const checkLocalStorageToken = (): boolean => {
        if (typeof window === "undefined") return false;

        try {
            const authToken = localStorage.getItem("auth-token");
            const userData = localStorage.getItem("user-data");

            console.log("🔍 ParameterDialog - Checking localStorage token:", {
                hasAuthToken: !!authToken,
                hasUserData: !!userData,
                authTokenLength: authToken?.length || 0,
            });

            return !!(authToken && userData);
        } catch (error) {
            console.error("Error checking localStorage token:", error);
            return false;
        }
    };

    // Use same session expired popup as Kassa Setup
    const showSessionExpiredPopup = () => {
        console.log("⚠️ Showing session expired popup");

        let timerInterval: NodeJS.Timeout;

        Swal.fire({
            icon: "warning",
            title: "Session Expired",
            html: `
        <div class="text-sm text-gray-600 mb-4">
          Your session has expired. Please login again.
        </div>
        <div class="text-xs text-gray-500">
          This popup will close automatically in <strong id="timer">3</strong> seconds
        </div>
      `,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true,
            confirmButtonText: "Login Now",
            confirmButtonColor: "#025CCA",
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                popup: "rounded-xl shadow-2xl",
                confirmButton: "rounded-lg px-6 py-2 font-medium",
                title: "text-lg font-bold text-red-600",
                htmlContainer: "text-sm",
            },
            background: "#ffffff",
            color: "#1f2937",
            didOpen: () => {
                const timer = Swal.getPopup()?.querySelector("#timer");
                let remainingTime = 3;

                timerInterval = setInterval(() => {
                    remainingTime--;
                    if (timer) {
                        timer.textContent = remainingTime.toString();
                    }

                    if (remainingTime <= 0) {
                        clearInterval(timerInterval);
                    }
                }, 1000);
            },
            willClose: () => {
                clearInterval(timerInterval);
            },
        }).then((result) => {
            console.log("🔥 Session expired popup result:", result);

            if (
                result.isConfirmed ||
                result.dismiss === Swal.DismissReason.timer
            ) {
                console.log("➡️ Opening login dialog");
                setShouldShowInterface(false);
            }
        });
    };

    // Reset everything when dialog opens
    useEffect(() => {
        if (isOpen) {
            console.log("🔍 ParameterDialog opened, resetting state...");

            // Reset all states first
            setShouldShowInterface(false);
            setShowReceiptPreview(false);

            // Check for valid token first
            const hasValidToken = checkLocalStorageToken();

            if (hasValidToken) {
                console.log(
                    "✅ ParameterDialog - Valid token found in localStorage"
                );
                setShouldShowInterface(true);
            } else {
                console.log(
                    "❌ ParameterDialog - No valid token, showing session expired"
                );
                showSessionExpiredPopup();
            }
        } else {
            setShouldShowInterface(false);
            setShowReceiptPreview(false);
        }
    }, [isOpen]);

    // Data initialization logic
    useEffect(() => {
        if (
            shouldShowInterface &&
            parameterData &&
            !isLoadingParameter &&
            cabangList.length > 0 &&
            areaList.length > 0
        ) {
            console.log("🔄 Initializing form data...");
            loadParameterDataToForm();
        }
    }, [
        shouldShowInterface,
        parameterData,
        isLoadingParameter,
        cabangList.length,
        areaList.length,
    ]);

    // Handle login success - simplified without authManager
    const handleLoginSuccessWithInterface = (userData: any) => {
        console.log("✅ Login successful, showing interface");

        // Save to localStorage
        try {
            localStorage.setItem("user-data", JSON.stringify(userData));
            localStorage.setItem("auth-token", "employee-token-" + Date.now());
        } catch (error) {
            console.error("Error saving user data:", error);
        }

        setShouldShowInterface(true);

        // Refetch data after successful login
        setTimeout(() => {
            refetchParameter();
            refetchCabang();
            refetchArea();
        }, 500);
    };

    // Handle login close - close main dialog completely
    const handleLoginCloseWithoutAuth = () => {
        console.log("❌ Login dialog closed without login");
        setShouldShowInterface(false);
        onClose(); // Close the main parameter dialog
    };

    const handleLogoutAndClose = async () => {
        try {
            await logout();
            console.log("✅ User logged out successfully");
        } catch (error) {
            console.error("❌ Logout error:", error);
        }
        onClose();
    };

    const convertYNToYaTidak = (value: "Y" | "N"): string => {
        return value === "Y" ? "Ya" : "Tidak";
    };

    const convertYaTidakToYN = (value: string): "Y" | "N" => {
        return value === "Ya" ? "Y" : "N";
    };

    const loadParameterDataToForm = () => {
        if (!parameterData) return;

        const selectedCabang = cabangList.find(
            (cabang) => cabang.kd_cabang === parameterData.kd_cab
        );
        const selectedArea = areaList.find(
            (area) => area.id_area === parameterData.kd_area
        );

        console.log("🔍 Loading parameter data:", {
            kd_cab: parameterData.kd_cab,
            kd_area: parameterData.kd_area,
        });

        setFormData({
            namaCabang: parameterData.kd_cab || "",
            namaCabangText: selectedCabang?.nama_cabang || "",
            namaArea: parameterData.kd_area || "",
            namaAreaText: selectedArea?.nama_area || "",
            lokasiDepo: parameterData.kd_depo || "",
            lokasiSatelit: parameterData.kd_satelit || "",
            cabangBaru: convertYNToYaTidak(parameterData.cabang_baru || "N"),
            rsia: convertYNToYaTidak(parameterData.rsia || "N"),
            barangTransit: convertYNToYaTidak(parameterData.transit || "N"),
            sc: (parameterData.service || 0).toString(),
            scDoctor: (parameterData.service_dokter || 0).toString(),
            ruResep: (parameterData.roundup_resep || 0).toString(),
            ruSwalayan: (parameterData.roundup_swalayan || 0).toString(),
            shift1Start: parameterData.shift_1_awal || "07:00:00",
            shift1End: parameterData.shift_1_akhir || "14:29:00",
            shift2Start: parameterData.shift_2_awal || "14:30:00",
            shift2End: parameterData.shift_2_akhir || "21:59:00",
            shift3Start: parameterData.shift_3_awal || "22:00:00",
            shift3End: parameterData.shift_3_akhir || "07:00:00",
            toleransiWaktuMin: (parameterData.toleransi_awal || 30).toString(),
            toleransiWaktuMax: (
                parameterData.toleransi_akhir || 120
            ).toString(),
            receiptType: "header" as const,
            header1: parameterData.header_struk_line1 || "",
            header2: parameterData.header_struk_line2 || "",
            header3: parameterData.header_struk_line3 || "",
            header4: parameterData.header_struk_line4 || "",
            header5: parameterData.header_struk_line5 || "",
            footer1: parameterData.footer_struk_line1 || "",
            footer2: parameterData.footer_struk_line2 || "",
            footer3: parameterData.footer_struk_line3 || "",
            footer4: parameterData.footer_struk_line4 || "",
        });

        console.log("✅ Form data loaded successfully");
    };

    const handleInputChange = (
        field: keyof ParameterFormData,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCabangChange = (kdCabang: string) => {
        const selectedCabang = cabangList.find(
            (cabang) => cabang.kd_cabang === kdCabang
        );

        setFormData((prev) => ({
            ...prev,
            namaCabang: kdCabang,
            namaCabangText: selectedCabang?.nama_cabang || "",
        }));
    };

    const handleAreaChange = (idArea: string) => {
        const selectedArea = areaList.find((area) => area.id_area === idArea);

        setFormData((prev) => ({
            ...prev,
            namaArea: idArea,
            namaAreaText: selectedArea?.nama_area || "",
        }));
    };

    const handleViewReceipt = () => {
        setShowReceiptPreview(true);
    };

    const handleHideReceipt = () => {
        setShowReceiptPreview(false);
    };

    const handleSubmit = async () => {
        const requiredFields = {
            namaCabang: "Nama Cabang",
            namaArea: "Nama Area",
        };

        const missingFields = [];
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field as keyof ParameterFormData]) {
                missingFields.push(label);
            }
        }

        if (missingFields.length > 0) {
            await showErrorAlert(
                "Validation Error",
                `Please select: ${missingFields.join(", ")}`,
                "OK"
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const updateData = {
                kd_cab: formData.namaCabang,
                kd_area: formData.namaArea,
                kd_depo: formData.lokasiDepo,
                kd_satelit: formData.lokasiSatelit,
                cabang_baru: convertYaTidakToYN(formData.cabangBaru),
                rsia: convertYaTidakToYN(formData.rsia),
                transit: convertYaTidakToYN(formData.barangTransit),
                service: parseInt(formData.sc) || 0,
                service_dokter: parseInt(formData.scDoctor) || 0,
                roundup_resep: parseInt(formData.ruResep) || 0,
                roundup_swalayan: parseInt(formData.ruSwalayan) || 0,
                shift_1_awal: formData.shift1Start,
                shift_1_akhir: formData.shift1End,
                shift_2_awal: formData.shift2Start,
                shift_2_akhir: formData.shift2End,
                shift_3_awal: formData.shift3Start,
                shift_3_akhir: formData.shift3End,
                toleransi_awal: parseInt(formData.toleransiWaktuMin) || 30,
                toleransi_akhir: parseInt(formData.toleransiWaktuMax) || 120,
                header_struk_line1: formData.header1,
                header_struk_line2: formData.header2,
                header_struk_line3: formData.header3,
                header_struk_line4: formData.header4,
                header_struk_line5: formData.header5,
                footer_struk_line1: formData.footer1,
                footer_struk_line2: formData.footer2,
                footer_struk_line3: formData.footer3,
                footer_struk_line4: formData.footer4,
                // Include all other required fields from parameterData
                kd_pt: parameterData?.kd_pt || "001",
                type_cab: parameterData?.type_cab || "1",
                trana: parameterData?.trana || 30,
                tranb: parameterData?.tranb || 60,
                intervala_fast: parameterData?.intervala_fast || 1000,
                intervala_midle: parameterData?.intervala_midle || 101,
                intervalb_midle: parameterData?.intervalb_midle || 1000,
                intervala_slow: parameterData?.intervala_slow || 1,
                intervalb_slow: parameterData?.intervalb_slow || 99,
                buffera_fast: parameterData?.buffera_fast || 8,
                bufferb_fast: parameterData?.bufferb_fast || 15,
                buffera_midle: parameterData?.buffera_midle || 3,
                bufferb_midle: parameterData?.bufferb_midle || 3,
                buffera_slow: parameterData?.buffera_slow || 1,
                bufferb_slow: parameterData?.bufferb_slow || 99,
                versi: parameterData?.versi || "0.0",
                migrasi: parameterData?.migrasi || "201708",
                drive: parameterData?.drive || "X",
                max_hari_retur: parameterData?.max_hari_retur || 3,
                aktif_f11: parameterData?.aktif_f11 || "N",
                footer_struk_line5: parameterData?.footer_struk_line5 || "",
                finger: parameterData?.finger || "Y",
                timer: parameterData?.timer || "00:00:25  ",
                transfer: parameterData?.transfer || "Y",
                ethical: parameterData?.ethical || "Y",
                otc: parameterData?.otc || "Y",
                huruf_berjalan: parameterData?.huruf_berjalan || "",
                timer_huruf: parameterData?.timer_huruf || 500,
                tranc: parameterData?.tranc || 90,
                trand: parameterData?.trand || 180,
                printer: parameterData?.printer || "L3110",
                grade: parameterData?.grade || "A",
                dokter_praktek: parameterData?.dokter_praktek || "Y",
                nomor_wa: parameterData?.nomor_wa || "",
                nama_olm: parameterData?.nama_olm || "",
                pembelian_langsung: parameterData?.pembelian_langsung || "Y",
                awal_jam_promo: parameterData?.awal_jam_promo || "00:00:00",
                akhir_jam_promo: parameterData?.akhir_jam_promo || "00:00:00",
                stock_online: parameterData?.stock_online || "Y",
                bpjs: parameterData?.bpjs || "N",
                promo_cashback: parameterData?.promo_cashback || "N",
                po_tac: parameterData?.po_tac || "N",
                min_buffer: parameterData?.min_buffer || 7,
                max_buffer: parameterData?.max_buffer || 10,
                insert_po: parameterData?.insert_po || "N",
                edit_po: parameterData?.edit_po || "N",
                cabang_central: parameterData?.cabang_central || "N",
                min_buffer_central: parameterData?.min_buffer_central || 7,
                max_buffer_central: parameterData?.max_buffer_central || 10,
                cabang_penyangga: parameterData?.cabang_penyangga || "N",
            };

            console.log("📤 Submitting parameter update...");

            const success = await updateParameter(updateData);

            if (success) {
                await showSuccessAlert(
                    "Success!",
                    "Parameter settings updated successfully",
                    1500
                );

                setTimeout(() => {
                    refetchParameter();
                    onSubmit(formData);
                    handleLogoutAndClose();
                }, 1000);
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("❌ Error submitting parameter:", error);
            await showErrorAlert(
                "Error",
                "An unexpected error occurred. Please try again.",
                "OK"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Show login dialog when not authenticated
    if (!shouldShowInterface) {
        return (
            <EmployeeLoginDialog
                isOpen={true}
                onClose={handleLoginCloseWithoutAuth}
                onLogin={handleLoginSuccessWithInterface}
            />
        );
    }

    if (isLoadingParameter || isLoadingCabang || isLoadingArea) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="bg-white rounded-lg p-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span>Loading parameter settings...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleLogoutAndClose}
            ></div>

            <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-5xl max-h-[98vh] relative z-10 flex flex-col shadow-2xl p-5">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-semibold text-black">
                        Parameter Setting
                    </h2>
                    <button
                        onClick={handleLogoutAndClose}
                        disabled={isSubmitting}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <div
                        className={`transition-all duration-500 ease-in-out ${
                            showReceiptPreview
                                ? "grid grid-cols-2 gap-3 h-full py-2"
                                : "grid grid-cols-2 gap-3 h-full py-2"
                        }`}
                    >
                        {/* LEFT SIDE: Changes based on receipt preview state */}
                        <div
                            className={`transition-all duration-500 ease-in-out ${
                                showReceiptPreview ? "space-y-6" : "space-y-6"
                            }`}
                        >
                            {showReceiptPreview ? (
                                // Receipt Form when preview is shown
                                <ParameterReceiptSection
                                    formData={formData}
                                    isSubmitting={isSubmitting}
                                    onInputChange={handleInputChange}
                                    onViewReceipt={handleHideReceipt}
                                    showPreview={true}
                                />
                            ) : (
                                // Parameter Form when no preview
                                <ParameterFormSection
                                    formData={formData}
                                    cabangOptions={cabangOptions}
                                    areaOptions={areaOptions}
                                    isLoadingCabang={isLoadingCabang}
                                    isLoadingArea={isLoadingArea}
                                    cabangError={cabangError}
                                    areaError={areaError}
                                    isSubmitting={isSubmitting}
                                    onInputChange={handleInputChange}
                                    onCabangChange={handleCabangChange}
                                    onAreaChange={handleAreaChange}
                                />
                            )}
                        </div>

                        {/* RIGHT SIDE: Changes based on receipt preview state */}
                        <div
                            className={`transition-all duration-500 ease-in-out transform ${
                                showReceiptPreview
                                    ? "translate-x-0 opacity-100"
                                    : "translate-x-0 opacity-100"
                            }`}
                        >
                            {showReceiptPreview ? (
                                // Receipt Preview when viewing receipt
                                <ParameterReceiptPreview formData={formData} />
                            ) : (
                                // Receipt Section when no preview
                                <ParameterReceiptSection
                                    formData={formData}
                                    isSubmitting={isSubmitting}
                                    onInputChange={handleInputChange}
                                    onViewReceipt={handleViewReceipt}
                                    showPreview={false}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={handleLogoutAndClose}
                        className="px-8 h-[44px]"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 px-8 h-[44px]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Updating...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ParameterSettingsDialog;
