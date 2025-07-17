// hooks/useDoctor.ts
"use client";

import { useState, useEffect } from "react";

interface DoctorData {
  id: number;
  fullname: string;
  phone: number;
  address: string;
  fee_consultation?: number;
  sip: string;
  url_photo?: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

interface DoctorPaginationData {
  docs: DoctorData[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

interface DoctorApiResponse {
  success: boolean;
  message: string;
  data?: DoctorPaginationData;
  errors?: any;
}

interface DoctorExternalApiResponse {
  message: string;
  data: DoctorPaginationData;
}

interface UseDoctorReturn {
  doctorList: DoctorData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalPages?: number;
  totalDocs?: number;
}

interface UseDoctorParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const useDoctor = (params: UseDoctorParams = {}): UseDoctorReturn => {
  const {
    limit = 100,
    offset = 0,
    search = "",
    sort_by = "id",
    sort_order = "desc",
  } = params;

  const [doctorList, setDoctorList] = useState<DoctorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>();
  const [totalDocs, setTotalDocs] = useState<number>();

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order,
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await fetch(`/api/doctor?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: DoctorApiResponse = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      if (data.success && data.data?.docs) {
        setDoctorList(data.data.docs);
        setTotalPages(data.data.totalPages);
        setTotalDocs(data.data.totalDocs);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch doctor data"
      );
      setDoctorList([]);
      setTotalPages(undefined);
      setTotalDocs(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [limit, offset, search, sort_by, sort_order]);

  const refetch = () => {
    fetchDoctors();
  };

  return {
    doctorList,
    isLoading,
    error,
    refetch,
    totalPages,
    totalDocs,
  };
};
