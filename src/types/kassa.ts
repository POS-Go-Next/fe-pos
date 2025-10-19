export interface KassaSetupData {
    antrian: boolean;
    status_aktif: boolean;
    finger: "Y" | "N";
    default_jual: string;
    device_id: string;
}

export interface PrinterData {
    id: number;
    nm_printer: string;
    status: boolean;
}

export interface KassaResponse {
    id_kassa: number;
    kd_cab: string;
    no_kassa: number;
    type_jual: string;
    antrian: boolean;
    status_aktif: boolean;
    status_operasional: string;
    user_operasional?: number;
    tanggal_update: string;
    user_update: string;
    status: string;
    finger: string;
    default_jual: string;
    device_id: string;
    is_deleted?: number;
    deleted_at?: string;
    ip_address: string;
    printer_id?: number;
    printer?: PrinterData;
}

export interface KassaApiResponse {
    success: boolean;
    message: string;
    data?: KassaResponse;
    errors?: Record<string, string[]>;
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
    device_id: string;
    selected_printer?: string;
    printer_id?: number;
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
    "SAMSUNG AUTO CUTTER",
] as const;
