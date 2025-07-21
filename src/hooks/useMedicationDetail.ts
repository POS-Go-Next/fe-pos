// hooks/useMedicationDetail.ts
"use client";

import { useState, useEffect } from "react";

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
  // Additional fields from with_info_obat
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
  // Additional fields from with_product_images
  product_images?: Array<{
    id: number;
    url: string;
    is_primary: boolean;
  }>;
}

interface MedicationDetailApiResponse {
  success: boolean;
  message: string;
  data?: MedicationDetailData;
  errors?: any;
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

  const fetchMedicationDetail = async () => {
    if (!kode_brg || !enabled) {
      setMedicationDetail(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        with_info_obat: "true",
        with_product_images: "true",
      });

      // Call our Next.js API route
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
        setMedicationDetail(data.data);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching medication detail:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch medication detail"
      );
      setMedicationDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationDetail();
  }, [kode_brg, enabled]);

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
