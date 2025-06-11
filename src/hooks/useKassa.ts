// hooks/useKassa.ts
'use client';

import { useState } from 'react';
import { showSessionExpiredAlert, handleApiError, isSessionExpired } from '@/lib/sessionHandler';

interface KassaSetupData {
  antrian: boolean;
  status_aktif: boolean;
  finger: 'Y' | 'N';
  default_jual: string;
  ip_address: string;
  mac_address: string;
}

interface KassaResponse {
  id_kassa: number;
  kd_cab: string;
  no_kassa: number;
  type_jual: string;
  antrian: boolean;
  status_aktif: boolean;
  status_operasional: string;
  user_operasional: number;
  tanggal_update: string;
  user_update: string;
  status: string;
  finger: string;
  default_jual: string;
  mac_address: string;
  is_deleted: number;
  deleted_at: string;
  ip_address: string;
}

interface KassaApiResponse {
  success: boolean;
  message: string;
  data?: KassaResponse;
  errors?: any;
}

interface UseKassaReturn {
  updateKassa: (macAddress: string, data: KassaSetupData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  lastResponse: KassaResponse | null;
}

export const useKassa = (): UseKassaReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<KassaResponse | null>(null);

  const updateKassa = async (macAddress: string, data: KassaSetupData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Updating kassa setup:', { macAddress, data });

      const response = await fetch(`/api/kassa/${macAddress}/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: KassaApiResponse = await response.json();

      if (!response.ok) {
        // Check if session expired
        if (isSessionExpired(response, result)) {
          await showSessionExpiredAlert();
          return false;
        }
        
        // Handle other API errors
        await handleApiError(response, result);
        return false;
      }

      if (result.success && result.data) {
        setLastResponse(result.data);
        console.log('✅ Kassa setup updated successfully:', result.data);
        return true;
      } else {
        throw new Error(result.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('❌ Error updating kassa:', err);
      
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update kassa setup');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateKassa,
    isLoading,
    error,
    lastResponse,
  };
};