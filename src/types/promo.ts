// types/promo.ts
export interface PromoData {
    id: string;
    promo_code?: string;
    code?: string;
    product_name?: string;
    name?: string;
    title?: string;
    promo_type?: string;
    type?: string;
    start_date?: string;
    startDate?: string;
    end_date?: string;
    endDate?: string;
    description?: string;
    discount_amount?: number;
    discount_percentage?: number;
    min_purchase?: number;
    max_discount?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
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
}
