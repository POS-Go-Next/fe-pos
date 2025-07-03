// hooks/useStock.ts
'use client';

import { useState, useEffect } from 'react';
import type { StockData, StockApiResponse, StockApiParams } from '@/types/stock';

interface UseStockReturn {
  stockList: StockData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalPages?: number;
  totalDocs?: number;
  currentPage?: number;
}

export const useStock = (params: StockApiParams = {}): UseStockReturn => {
  const { limit = 10, offset = 0, search = "" } = params;
  
  const [stockList, setStockList] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>();
  const [totalDocs, setTotalDocs] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();

  const fetchStock = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (search) {
        queryParams.append('search', search);
      }

      const response = await fetch(`/api/stock?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: StockApiResponse = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success && data.data?.docs) {
        setStockList(data.data.docs);
        setTotalPages(data.data.totalPages);
        setTotalDocs(data.data.totalDocs);
        setCurrentPage(data.data.page);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      setStockList([]);
      setTotalPages(undefined);
      setTotalDocs(undefined);
      setCurrentPage(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [limit, offset, search]);

  const refetch = () => {
    fetchStock();
  };

  return {
    stockList,
    isLoading,
    error,
    refetch,
    totalPages,
    totalDocs,
    currentPage,
  };
};