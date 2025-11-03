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
     type?: "R/" | "RC" | "R-Commitment" | string;
     price: number;
     quantity: number;
     subtotal: number;
     
     // Discount Fields (API: discount is PERCENTAGE, nominal_discount is FIXED)
     /**
      * @deprecated Use discountPercentage instead for clarity
      */
     discount?: number;
     discountPercentage?: number;        // Percentage (0-100), maps to discount
     nominalDiscount?: number;           // Fixed amount discount, maps to nominal_discount
     
     sc: number;
     misc: number;
     
     // Promo Fields (API has: disc_promo, value_promo, no_promo, promo_type)
     /**
      * @deprecated Use discPromo instead for clarity
      */
     promo?: number;
     discPromo?: number;                 // Promo discount amount, maps to disc_promo
     valuePromo?: number;                // Promo value/amount, maps to value_promo
     noPromo?: string;                   // Promo identifier, maps to no_promo
     promoType?: string;                 // Promo type code, maps to promo_type
     /**
      * @deprecated This field conflicts with promo. Use discPromo or valuePromo instead
      */
     promoPercent?: number;
     
     // Item-level adjustments
     roundUp?: number;                   // Per-item round-up, maps to round_up
     
     // Legacy fields (deprecated but kept for backward compatibility)
     /**
      * @deprecated Use noPromo instead
      */
     noVoucher?: number;
     
     total?: number;
     stockData?: StockData;
     isOriginalReturnItem?: boolean; // Indicates if this item is from the original transaction being returned
     isDeleted?: boolean; // Indicates if this original return item has been marked as deleted
     up?: string;
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
