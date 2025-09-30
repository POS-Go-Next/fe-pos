export interface TransactionApiParams {
  offset?: number;
  limit?: number;
  date_gte?: string;
  date_lte?: string;
  bought_product_code?: string;
}

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
  cashier?: string;
  customer_name?: string;
  doctor_name?: string;
  total_items?: number;
  payment_type?: string;
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
  errors?: any;
}

export interface TransactionExternalApiResponse {
  message: string;
  data: TransactionPaginationData;
}

export interface TransactionItem {
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
  discount: number;
  sub_total: number;
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
  errors?: any;
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
  errors?: any;
}

export interface PrintTransactionPayload {
  device_id: string;
}

export interface PrintTransactionResponse {
  success: boolean;
  message: string;
  data?: any;
}
