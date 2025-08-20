// types/user.ts
export interface UserData {
    id: number;
    fullname: string;
    username: string;
    email: string;
    phone?: string;
    role_id: number;
    position_id?: number;
    // Updated field names to match API response
    fingerprint1Exist?: boolean;
    fingerprint2Exist?: boolean;
    // Keep backward compatibility
    fingerprint1?: string;
    fingerprint2?: string;
}

export interface UserPaginationData {
    docs: UserData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface UserApiResponse {
    success: boolean;
    message: string;
    data?: UserPaginationData;
    errors?: any;
}

export interface UserExternalApiResponse {
    message: string;
    data: UserPaginationData;
}

export interface UserApiParams {
    offset?: number;
    limit?: number;
    search?: string;
}

export interface FingerprintSetupData {
    user_id: number;
    mac_address: string;
    number_of_fingerprint: 1 | 2;
}

export interface FingerprintSetupResponse {
    success: boolean;
    message: string;
    data?: any;
    errors?: any;
}

export interface FingerprintData {
    user_id: number;
    number_of_fingerprint: 1 | 2;
    firstScan: boolean;
    rescan: boolean;
}

export interface FingerprintOption {
    id: 1 | 2;
    name: "Finger 1" | "Finger 2";
}
