export interface CustomerData {
    kd_cust: number;
    nm_cust: string;
    usia_cust: number;
    gender: string;
    telp_cust: string;
    al_cust: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface CustomerPaginationData {
    docs: CustomerData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface CustomerApiResponse {
    success: boolean;
    message: string;
    data?: CustomerPaginationData;
    errors?: Record<string, string[]>;
}

export interface CustomerExternalApiResponse {
    message: string;
    data: CustomerPaginationData;
}

export interface CustomerApiParams {
    offset?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface CustomerFormData {
    id: number;
    name: string;
    gender: string;
    age: string;
    phone: string;
    address: string;
    status: string;
}

export const transformCustomerApiToForm = (
    customer: CustomerData
): CustomerFormData => {
    return {
        id: customer.kd_cust,
        name: customer.nm_cust,
        gender: customer.gender === "male" ? "Male" : "Female",
        age: customer.usia_cust?.toString(),
        phone: customer.telp_cust.startsWith("+62")
            ? customer.telp_cust
            : `+62 ${customer.telp_cust}`,
        address: customer.al_cust,
        status: customer.status ? "AKTIF" : "TIDAK AKTIF",
    };
};

export const transformCustomerFormToApi = (
    form: CustomerFormData
): Partial<CustomerData> => {
    return {
        kd_cust: form.id,
        nm_cust: form.name,
        usia_cust: parseInt(form.age) || 0,
        gender: form.gender.toLowerCase(),
        telp_cust: form.phone.replace("+62 ", ""),
        al_cust: form.address,
        status: form.status === "AKTIF",
    };
};
