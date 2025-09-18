export interface CorporateData {
    kd_corp: string;
    nm_corp: string;
    al_corp1: string;
    al_corp2: string;
    telp_corp: string;
    contact: string;
    rules: number;
    piutang: boolean;
    tagihan_max: number;
    aktif: boolean;
    no_polis: boolean;
    digit_polis: number;
    valid_polis: boolean;
    user_id: string;
    tgl_input: string;
    hna: boolean;
    revisi: boolean;
    status: string;
    piutang_awal: number;
    total_piutang: number;
    total_retur: number;
    total_pelunasan: number;
    saldo_piutang: number;
    saldo_awal: number;
    karyawan: string;
    rules2: number;
    rules3: number;
    margin: boolean | null;
    tempo: number;
}

export interface CorporatePaginationData {
    docs: CorporateData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

export interface CorporateApiResponse {
    success: boolean;
    message: string;
    data?: CorporatePaginationData;
    errors?: any;
}

export interface CorporateExternalApiResponse {
    message: string;
    data: CorporatePaginationData;
}

export interface CorporateApiParams {
    offset?: number;
    limit?: number;
    search?: string;
    type: "corporate";
}

export interface CorporateDialogData {
    idCorp: string;
    corporateName: string;
    rules: number;
    rules1: number;
    piutang: boolean;
    margin: boolean;
}

export const transformCorporateApiToDialog = (
    corporate: CorporateData
): CorporateDialogData => {
    return {
        idCorp: corporate.kd_corp,
        corporateName: corporate.nm_corp.trim(),
        rules: corporate.rules,
        rules1: corporate.rules2,
        piutang: corporate.piutang,
        margin: corporate.margin || false,
    };
};
