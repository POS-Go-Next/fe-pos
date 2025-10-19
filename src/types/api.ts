export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginationData<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export type PaginatedApiResponse<T> = BaseApiResponse<PaginationData<T>>;

export interface ApiParams {
  offset?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}