"use client";

import { useState, useEffect } from "react";
import { clientFetch } from "./client-utils";


export interface PaginatedParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface PaginatedHookReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalPages?: number;
  totalDocs?: number;
  currentPage?: number;
}

export function usePaginatedApi<T>(
  endpoint: string,
  params: PaginatedParams = {},
  debugName?: string
): PaginatedHookReturn<T> {
  const { limit = 100, offset = 0, search = "", sort_by = "id", sort_order = "desc" } = params;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>();
  const [totalDocs, setTotalDocs] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();

  const fetchData = async () => {
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

      const url = `${endpoint}?${queryParams.toString()}`;
      


      const { data: responseData } = await clientFetch(url);



      if (responseData.success && responseData.data?.docs) {
        setData(responseData.data.docs);
        setTotalPages(responseData.data.totalPages);
        setTotalDocs(responseData.data.totalDocs);
        setCurrentPage(responseData.data.page);
      } else {
        throw new Error(responseData.message || "Invalid response format");
      }
    } catch (err) {
      console.error(`Error fetching ${debugName || endpoint}:`, err);
      setError(
        err instanceof Error ? err.message : `Failed to fetch ${debugName || "data"}`
      );
      setData([]);
      setTotalPages(undefined);
      setTotalDocs(undefined);
      setCurrentPage(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, search, sort_by, sort_order, endpoint]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    totalPages,
    totalDocs,
    currentPage,
  };
}