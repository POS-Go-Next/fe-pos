// types/kassa.ts
export interface KassaSetupData {
  antrian: boolean;
  status_aktif: boolean;
  finger: "Y" | "N";
  default_jual: string;
  ip_address: string;
  mac_address: string;
}

export interface KassaResponse {
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

export interface KassaApiResponse {
  success: boolean;
  message: string;
  data?: KassaResponse;
  errors?: any;
}

export interface KassaExternalApiResponse {
  message: string;
  data: KassaResponse;
}

export interface KassaFormState {
  antrian: boolean;
  status_aktif: boolean;
  finger: "Y" | "N";
  default_jual: "0" | "1" | "2";
  ip_address: string;
  mac_address: string;
  selected_printer?: string;
}

export const KASSA_DEFAULT_JUAL_OPTIONS = {
  "0": "Swalayan",
  "1": "Resep",
  "2": "Both",
} as const;

export const KASSA_PRINTER_OPTIONS = [
  "Epson TMU 220B-776 Auto Cutter USB Dot Matrix",
  "Epson TMU Auto Cutter",
  "HP LaserJet",
  "Canon PIXMA",
] as const;
