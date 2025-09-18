export interface AreaData {
    id_area: string;
    nama_area: string;
}

export interface AreaPaginationData {
    docs: AreaData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface AreaApiResponse {
    success: boolean;
    message: string;
    data?: AreaPaginationData;
    errors?: any;
}

export interface AreaExternalApiResponse {
    message: string;
    data: AreaPaginationData;
}

export interface AreaApiParams {
    offset?: number;
    limit?: number;
    search?: string;
}
