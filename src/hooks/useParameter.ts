// hooks/useParameter.ts - FIXED VERSION
"use client";

import { useState, useEffect } from "react";

interface ParameterData {
    service: number;
    roundup_resep: number;
    roundup_swalayan: number;
    kd_pt: string;
    kd_area: string;
    kd_cab: string;
    kd_depo: string;
    kd_satelit: string;
    type_cab: string;
    transit: "Y" | "N";
    toleransi_awal: number;
    toleransi_akhir: number;
    shift_1_awal: string;
    shift_1_akhir: string;
    shift_2_awal: string;
    shift_2_akhir: string;
    shift_3_awal: string;
    shift_3_akhir: string;
    trana: number;
    tranb: number;
    intervala_fast: number;
    intervala_midle: number;
    intervalb_midle: number;
    intervala_slow: number;
    intervalb_slow: number;
    buffera_fast: number;
    bufferb_fast: number;
    buffera_midle: number;
    bufferb_midle: number;
    buffera_slow: number;
    bufferb_slow: number;
    header_struk_line1: string;
    header_struk_line2: string;
    header_struk_line3: string;
    header_struk_line4: string;
    header_struk_line5: string;
    footer_struk_line1: string;
    footer_struk_line2: string;
    footer_struk_line3: string;
    footer_struk_line4: string;
    footer_struk_line5: string;
    versi: string;
    cabang_baru: "Y" | "N";
    rsia: "Y" | "N";
    migrasi: string;
    drive: string;
    max_hari_retur: number;
    aktif_f11: "Y" | "N";
    finger: "Y" | "N";
    timer: string;
    transfer: "Y" | "N";
    ethical: "Y" | "N";
    otc: "Y" | "N";
    huruf_berjalan: string;
    timer_huruf: number;
    tranc: number;
    trand: number;
    printer: string;
    grade: string;
    dokter_praktek: "Y" | "N";
    nomor_wa: string;
    nama_olm: string;
    pembelian_langsung: "Y" | "N";
    service_dokter: number;
    awal_jam_promo: string;
    akhir_jam_promo: string;
    stock_online: "Y" | "N";
    bpjs: "Y" | "N";
    promo_cashback: "Y" | "N";
    po_tac: "Y" | "N";
    min_buffer: number;
    max_buffer: number;
    insert_po: "Y" | "N";
    edit_po: "Y" | "N";
    cabang_central: "Y" | "N";
    min_buffer_central: number;
    max_buffer_central: number;
    cabang_penyangga: "Y" | "N";
}

interface ParameterApiResponse {
    message: string;
    data: ParameterData;
}

interface UseParameterReturn {
    parameterData: ParameterData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    updateParameter: (updatedData: Partial<ParameterData>) => Promise<boolean>;
}

export const useParameter = (): UseParameterReturn => {
    const [parameterData, setParameterData] = useState<ParameterData | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchParameter = async (force: boolean = false) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log("🔄 Fetching parameter data...", {
                force,
                timestamp: new Date().toISOString(),
            });

            // 🔥 FIX 1: Add cache-busting with timestamp AND random number to ensure fresh data
            const cacheBuster = `?_t=${Date.now()}&_r=${Math.random()}`;

            // 🔥 FIX 2: Stronger cache control headers
            const response = await fetch(`/api/parameter/me${cacheBuster}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control":
                        "no-cache, no-store, must-revalidate, max-age=0",
                    Pragma: "no-cache",
                    Expires: "0",
                    // 🔥 FIX 3: Add additional headers to prevent any caching
                    "If-None-Match": "*",
                    "If-Modified-Since": "Thu, 01 Jan 1970 00:00:00 GMT",
                },
                // 🔥 FIX 4: Disable Next.js caching completely
                cache: "no-store",
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ParameterApiResponse = await response.json();

            console.log("✅ Parameter data fetched successfully:", {
                kd_area: result.data?.kd_area,
                kd_cab: result.data?.kd_cab,
                timestamp: new Date().toISOString(),
                // 🔥 FIX 5: Log important fields to verify data freshness
                service: result.data?.service,
                roundup_resep: result.data?.roundup_resep,
            });

            if (result.data) {
                // 🔥 FIX 6: Force re-render by creating new object reference
                setParameterData({ ...result.data });
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("❌ Error fetching parameter:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch parameter data"
            );
            setParameterData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateParameter = async (
        updatedData: Partial<ParameterData>
    ): Promise<boolean> => {
        try {
            setError(null);

            console.log("🔄 UPDATE PARAMETER HOOK - Starting update...");
            console.log("📤 Data being sent to API:", updatedData);

            const response = await fetch("/api/parameter/upsert", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 🔥 FIX 7: Prevent caching of POST request
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                },
                body: JSON.stringify(updatedData),
            });

            console.log("📡 API Response Status:", response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                const errorData = await response.json();
                console.log("❌ API Error Response:", errorData);
                throw new Error(
                    errorData.message || "Failed to update parameter"
                );
            }

            const responseData = await response.json();
            console.log("✅ API Success Response:", responseData);

            // 🔥 FIX 8: IMMEDIATELY update local state with merged data
            if (parameterData) {
                const updatedParameterData = {
                    ...parameterData,
                    ...updatedData,
                };
                console.log("🔄 Updating local state IMMEDIATELY:", {
                    before: {
                        kd_area: parameterData.kd_area,
                        kd_cab: parameterData.kd_cab,
                        service: parameterData.service,
                    },
                    after: {
                        kd_area: updatedParameterData.kd_area,
                        kd_cab: updatedParameterData.kd_cab,
                        service: updatedParameterData.service,
                    },
                });
                setParameterData(updatedParameterData);
            }

            // 🔥 FIX 9: Force refresh from server after shorter delay
            setTimeout(async () => {
                console.log("🔄 FORCED refresh from server after update...");
                await fetchParameter(true);
            }, 500); // Reduced from 1000ms to 500ms

            return true;
        } catch (err) {
            console.error("❌ Error updating parameter:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update parameter"
            );
            return false;
        }
    };

    useEffect(() => {
        fetchParameter();
    }, []);

    const refetch = () => {
        console.log("🔄 Manual refetch triggered");
        fetchParameter(true);
    };

    return {
        parameterData,
        isLoading,
        error,
        refetch,
        updateParameter,
    };
};
