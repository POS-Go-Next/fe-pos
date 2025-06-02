// types/cabang.ts
export interface CabangData {
  kd_cabang: string;
  nama_cabang: string;
  alamat: string;
  no_telepon: string;
  no_hp: string;
}

export interface CabangPaginationData {
  docs: CabangData[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface CabangApiResponse {
  success: boolean;
  message: string;
  data?: CabangPaginationData;
  errors?: any;
}

export interface CabangExternalApiResponse {
  message: string;
  data: CabangPaginationData;
}

export interface CabangApiParams {
  offset?: number;
  limit?: number;
  search?: string;
}
