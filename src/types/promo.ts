// types/promo.ts
export interface PromoData {
    no_promo: string;
    jns_promo: string;
    tgl_awal_promo: string;
    tgl_akhir_promo: string;
    kd_brgdg: string;
    nm_brgdg: string;
    disc_promo: number;
    nilai_promo: number;
    kd_brgdg_promo: string;
    qty_get: number;
    qty_promo: number;
    kd_brgdg_bundling: string;
    plafon_promo: number;
    harga_sebelum: number;
    harga_sesudah: number;
    coupon_name: string;
    jenis_promo: {
        jns_promo: number;
        nm_promo: string;
    };
}

export interface PromoPaginationData {
    docs: PromoData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface PromoApiResponse {
    success: boolean;
    message: string;
    data?: PromoPaginationData;
    errors?: any;
}

export interface PromoExternalApiResponse {
    message: string;
    data: PromoPaginationData;
}

export interface PromoApiParams {
    offset?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface PromoFormData {
    promo_code: string;
    product_name: string;
    promo_type: string;
    start_date: string;
    end_date: string;
    description?: string;
    discount_amount?: number;
    discount_percentage?: number;
    min_purchase?: number;
    max_discount?: number;
    is_active?: boolean;
}

// Transformed interface for UI display
export interface PromoDisplayData {
    id: string;
    promo_id: string;
    product_name: string;
    promo_type: string;
    start_date: string;
    end_date: string;
    disc_promo: number;
    harga_sebelum: number;
    harga_sesudah: number;
}
