// types/transaction.ts - CORRECTED TO MATCH API RESPONSE STRUCTURE

// Interface untuk parameters API transaksi - UPDATED WITH PRODUCT CODE FILTER
export interface TransactionApiParams {
    offset?: number;
    limit?: number;
    from_date?: string;
    to_date?: string;
    bought_product_code?: string; // NEW: Add product code filter parameter
}

// Interface untuk data transaksi yang sesuai dengan API response
export interface TransactionData {
    id: string;
    invoice_number: string;
    customer_id: string;
    doctor_id: number;
    corporate_code: string;
    transaction_type: string;
    transaction_action: string;
    compounded: boolean;
    full_prescription: boolean;
    availability: boolean;
    notes: string;
    transaction_date: string;
    shift: string;
    kd_kasir: string;
    kd_kassa: string;
    cash: number;
    change_cash: number;
    change_cc: number;
    change_dc: number;
    credit_card: number;
    debit_card: number;
    no_cc: string;
    no_dc: string;
    edc_cc: string;
    edc_dc: string;
    publisher_cc: string;
    publisher_dc: string;
    type_cc: string;
    type_dc: string;
    sub_total: number;
    misc: number;
    service_fee: number;
    discount: number;
    promo: number;
    round_up: number;
    grand_total: number;
    items: TransactionItem[];
    // Optional derived fields
    cashier?: string;
    customer_name?: string;
    doctor_name?: string;
    total_items?: number;
    payment_type?: string;
}

// Interface untuk pagination data transaksi
export interface TransactionPaginationData {
    docs: TransactionData[];
    totalDocs: number;
    page: number;
    totalPages: number;
}

// Interface untuk API response transaksi list
export interface TransactionApiResponse {
    success: boolean;
    message: string;
    data?: TransactionPaginationData;
    errors?: any;
}

// Interface untuk external API response transaksi list
export interface TransactionExternalApiResponse {
    message: string;
    data: TransactionPaginationData;
}

// Interface untuk item detail transaksi
export interface TransactionItem {
    product_code: string;
    product_name: string;
    quantity: number;
    price: number;
    discount: number;
    sub_total: number;
    // Additional fields that might be present
    unit?: string;
    batch?: string;
    expired_date?: string;
}

// Interface untuk payment details
export interface PaymentDetails {
    payment_type: string;
    amount_paid: number;
    change: number;
    cash?: number;
    credit_card?: number;
    debit_card?: number;
    change_cash?: number;
    change_cc?: number;
    change_dc?: number;
}

// Interface untuk detail transaksi lengkap
export interface TransactionDetailData {
    invoice_number: string;
    transaction_date: string;
    customer_name: string;
    doctor_name: string;
    cashier: string;
    items: TransactionItem[];
    sub_total: number;
    discount: number;
    misc: number;
    service_fee?: number;
    promo: number;
    round_up?: number;
    grand_total: number;
    payment_details: PaymentDetails;
    // Additional transaction info
    shift?: string;
    kassa?: string;
    corporate_code?: string;
    notes?: string;
}

// Interface untuk API response detail transaksi
export interface TransactionDetailApiResponse {
    success: boolean;
    message: string;
    data?: TransactionDetailData;
    errors?: any;
}

// Interface untuk external API response detail transaksi
export interface TransactionDetailExternalApiResponse {
    message: string;
    data: TransactionDetailData;
}

// Transaction creation interfaces
export interface CreateTransactionItem {
    product_code: string;
    quantity: number;
    price: number;
    discount?: number;
    unit?: string;
    batch?: string;
    expired_date?: string;
}

export interface CreateTransactionPayload {
    mac_address: string;
    invoice_number: string;
    customer_id: string;
    doctor_id?: number;
    corporate_code?: string;
    transaction_type?: string;
    transaction_action?: string;
    compounded?: boolean;
    full_prescription?: boolean;
    availability?: boolean;
    notes?: string;
    shift?: string;
    kd_kasir: string;
    kd_kassa: string;
    cash: number;
    credit_card?: number;
    debit_card?: number;
    no_cc?: string;
    no_dc?: string;
    edc_cc?: string;
    edc_dc?: string;
    publisher_cc?: string;
    publisher_dc?: string;
    type_cc?: string;
    type_dc?: string;
    sub_total: number;
    misc?: number;
    service_fee?: number;
    discount?: number;
    promo?: number;
    round_up?: number;
    grand_total: number;
    items: CreateTransactionItem[];
}

export interface CreateTransactionResponse {
    success: boolean;
    message: string;
    data?: {
        transaction_id: string;
        invoice_number: string;
        grand_total: number;
        created_at: string;
    };
    errors?: any;
}
