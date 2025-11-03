export interface TransactionApiParams {
  offset?: number;
  limit?: number;
  date_gte?: string;
  date_lte?: string;
  bought_product_code?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CustomerData {
  kd_cust?: number;
  nm_cust?: string;
  usia_cust?: number;
  gender?: string;
  telp_cust?: string;
  al_cust?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorData {
  id?: number;
  fullname?: string;
  phone?: string;
  address?: string;
  fee_consultation?: number;
  sip?: string;
  url_photo?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionData {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer?: CustomerData;
  doctor_id: number;
  doctor?: DoctorData;
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
  cashier?: string;
  customer_name?: string;
  doctor_name?: string;
  total_items?: number;
  payment_type?: string;
  retur_reason?: string;
  confirmation_retur_by?: string;
  retur_information?: string;
}

export interface TransactionPaginationData {
  docs: TransactionData[];
  totalDocs: number;
  page: number;
  totalPages: number;
}

export interface TransactionApiResponse {
  success: boolean;
  message: string;
  data?: TransactionPaginationData;
  errors?: Record<string, string[]>;
}

export interface TransactionExternalApiResponse {
  message: string;
  data: TransactionPaginationData;
}

export interface TransactionItem {
  product_code: string;
  product_name: string;
  price: number;
  quantity: number;
  prescription_code?: string;
  sub_total: number;
  nominal_discount: number;
  discount: number;
  service_fee: number;
  misc: number;
  disc_promo: number;
  value_promo: number;
  no_promo?: string;
  promo_type?: string;
  up_selling: string;
  total: number;
  round_up: number;
  // Legacy fields that may still be used
  unit?: string;
  batch?: string;
  expired_date?: string;
}

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
  shift?: string;
  kassa?: string;
  corporate_code?: string;
  notes?: string;
}

export interface TransactionDetailApiResponse {
  success: boolean;
  message: string;
  data?: TransactionDetailData;
  errors?: Record<string, string[]>;
}

export interface TransactionDetailExternalApiResponse {
  message: string;
  data: TransactionDetailData;
}

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
  errors?: Record<string, string[]>;
}

export interface PrintTransactionPayload {
  device_id: string;
}

export interface PrintTransactionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}
