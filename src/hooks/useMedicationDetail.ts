"use client";

import { useState, useEffect, useCallback } from "react";

interface MedicationDetailData {
    kode_brg: string;
    nama_brg: string;
    id_dept: string;
    isi: number;
    id_satuan: number;
    mark_up: number;
    hb_netto: number;
    hb_gross: number;
    hj_ecer: number;
    hj_bbs: number;
    id_pabrik: string;
    barcode: string;
    q_bbs: number;
    moq: number;
    hna: number;
    tgl_berlaku_nie: string;
    info_obat?: {
        deskripsi?: string;
        indikasi?: string;
        komposisi?: string;
        dosis?: string;
        aturan_pakai?: string;
        peringatan?: string;
        kontraindikasi?: string;
        efek_samping?: string;
        segmentasi?: string;
        kemasan?: string;
        nama_pabrik?: string;
        no_reg?: string;
    };
    product_images?: Array<{
        id: number;
        kd_brgdg: string;
        url: string;
        gambar: string;
        main_display: boolean;
        created_at: string;
        is_primary?: boolean;
    }>;
}

interface MedicationDetailApiResponse {
    success: boolean;
    message: string;
    data?: MedicationDetailData;
    errors?: Record<string, string[]>;
}

interface UseMedicationDetailReturn {
    medicationDetail: MedicationDetailData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UseMedicationDetailParams {
    kode_brg: string | null;
    enabled?: boolean;
}

export const useMedicationDetail = ({
    kode_brg,
    enabled = true,
}: UseMedicationDetailParams): UseMedicationDetailReturn => {
    const [medicationDetail, setMedicationDetail] =
        useState<MedicationDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMedicationDetail = useCallback(async () => {
        if (!kode_brg || !enabled) {
            setMedicationDetail(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const queryParams = new URLSearchParams({
                with_info_obat: "true",
                with_product_images: "true",
            });

            const response = await fetch(
                `/api/stock/${kode_brg}?${queryParams.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data: MedicationDetailApiResponse = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }
                throw new Error(
                    data.message || `HTTP error! status: ${response.status}`
                );
            }

            if (data.success && data.data) {
                const processedData = { ...data.data };
                if (
                    processedData.product_images &&
                    Array.isArray(processedData.product_images)
                ) {
                    processedData.product_images =
                        processedData.product_images.map((img: {
                            id: number;
                            kd_brgdg: string;
                            url?: string;
                            gambar: string;
                            main_display: boolean;
                            created_at: string;
                        }) => ({
                            id: img.id,
                            kd_brgdg: img.kd_brgdg,
                            url: img.url || img.gambar,
                            gambar: img.gambar,
                            main_display: img.main_display,
                            created_at: img.created_at,
                            is_primary: img.main_display,
                        }));
                }

                setMedicationDetail(processedData);
            } else {
                throw new Error(data.message || "Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching medication detail:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch medication detail"
            );
            setMedicationDetail(null);
        } finally {
            setIsLoading(false);
        }
    }, [kode_brg, enabled]);

    useEffect(() => {
        fetchMedicationDetail();
    }, [fetchMedicationDetail]);

    const refetch = () => {
        fetchMedicationDetail();
    };

    return {
        medicationDetail,
        isLoading,
        error,
        refetch,
    };
};
