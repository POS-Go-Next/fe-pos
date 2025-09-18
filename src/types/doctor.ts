export interface DoctorData {
    id: number;
    fullname: string;
    phone: number;
    address: string;
    fee_consultation?: number;
    sip: string;
    url_photo?: string;
    email?: string;
    created_at: string;
    updated_at?: string;
}

export interface DoctorPaginationData {
    docs: DoctorData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface DoctorApiResponse {
    success: boolean;
    message: string;
    data?: DoctorPaginationData;
    errors?: any;
}

export interface DoctorExternalApiResponse {
    message: string;
    data: DoctorPaginationData;
}

export interface DoctorApiParams {
    offset?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface DoctorFormData {
    fullname: string;
    phone: string;
    address: string;
    fee_consultation?: number;
    sip: string;
    url_photo?: string;
    email?: string;
}
