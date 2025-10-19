export interface ProductImage {
    id: number;
    kd_brgdg: string;
    gambar: string;
    main_display?: boolean;
    created_at?: string;
}

export interface StockData {
    kode_brg: string;
    nama_brg: string;
    id_dept: string;
    isi: number;
    id_satuan: number;
    strip: number;
    mark_up: number;
    hb_netto: number;
    hb_gross: number;
    hj_ecer: number;
    hj_bbs: number;
    id_kategori: string;
    id_pabrik: string;
    barcode: string;
    q_bbs: number;
    satuan: string;
    hna: number;
    moq?: number;
    min_bulan_ed?: number;
    q_akhir?: number;
    product_images?: ProductImage[];
    info_obat?: Record<string, unknown>;
}

export interface StockPaginationData {
    docs: StockData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface StockApiResponse {
    success: boolean;
    message: string;
    data?: StockPaginationData;
    errors?: Record<string, string[]>;
}

export interface StockExternalApiResponse {
    message: string;
    data: StockPaginationData;
}

export interface StockApiParams {
    offset?: number;
    limit?: number;
    search?: string;
}

export interface ProductTableItem {
    id: number;
    name: string;
    type?: "R/" | "RC" | "OTC" | string;
    price: number;
    quantity: number;
    subtotal: number;
    discount: number;
    sc: number;
    misc: number;
    promo?: number;
    promoPercent?: number;
    up?: string;
    noVoucher?: number;
    total?: number;
    stockData?: StockData;
}

export const STOCK_CATEGORIES = {
    "001": "OTC",
    "002": "Ethical",
    "003": "Supplement",
} as const;

export const STOCK_DEPARTMENTS = {
    A1: "Obat Keras",
    A2: "Obat Bebas",
    H3: "Herbal",
    L: "Alat Kesehatan",
    N4: "Kosmetik",
    S: "Supplement",
    U: "Makanan & Minuman",
} as const;
