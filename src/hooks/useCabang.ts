// hooks/useCabang.ts
'use client';

import { useState, useEffect } from 'react';

interface CabangData {
  kd_cabang: string;
  nama_cabang: string;
  alamat: string;
  no_telepon: string;
  no_hp: string;
}

interface CabangApiResponse {
  success: boolean;
  message: string;
  data?: {
    docs: CabangData[];
    totalDocs: number;
    page: number;
    totalPages: number;
  };
  errors?: any;
}

interface UseCabangReturn {
  cabangList: CabangData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalPages?: number;
  totalDocs?: number;
}

interface UseCabangParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export const useCabang = (params: UseCabangParams = {}): UseCabangReturn => {
  const { limit = 50, offset = 0, search = "" } = params;
  
  const [cabangList, setCabangList] = useState<CabangData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>();
  const [totalDocs, setTotalDocs] = useState<number>();

  const fetchCabang = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (search) {
        queryParams.append('search', search);
      }

      // Call our Next.js API route instead of external API directly
      const response = await fetch(`/api/cabang?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: CabangApiResponse = await response.json();
      
      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.data?.docs) {
        setCabangList(data.data.docs);
        setTotalPages(data.data.totalPages);
        setTotalDocs(data.data.totalDocs);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching cabang:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cabang data');
      setCabangList([]);
      setTotalPages(undefined);
      setTotalDocs(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCabang();
  }, [limit, offset, search]);

  const refetch = () => {
    fetchCabang();
  };

  return {
    cabangList,
    isLoading,
    error,
    refetch,
    totalPages,
    totalDocs,
  };
};