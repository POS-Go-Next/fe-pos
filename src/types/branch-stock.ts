export interface CabangData {
    kd_cabang: string;
    nama_cabang: string;
    alamat: string;
    no_telepon: string;
    no_hp: string;
}

export interface StockDetail {
    id: number;
    kd_brgdg: string;
    kd_cab: string;
    stock: number;
    transit: number;
    booking: number;
    status_aktif: string;
    qty_expired: number;
    qty_expired_sup: number;
    hpp: number;
    tanggal_update: string;
    qty_rusak: number;
    qty_rusak_sup: number;
    qty_konsinyasi: number;
    qty_konsinyasi_sup: number;
    qty_expired_transit: number;
    qty_rusak_transit: number;
    qty_konsinyasi_transit: number;
    created_at: string;
    updated_at: string;
    is_delete: string;
    status_f9: number;
    cabang: CabangData;
}

export interface BranchWideStockData {
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
    stock_details: StockDetail[];
}

export interface BranchWideStockApiResponse {
    success: boolean;
    message: string;
    data?: BranchWideStockData;
    errors?: any;
}

export interface BranchWideStockExternalApiResponse {
    message: string;
    data: BranchWideStockData;
}

export interface BranchStockTableData {
    idBranch: string;
    branchName: string;
    stock: number;
    dateAdded: string;
    phoneNumber: string;
    description: string;
}
