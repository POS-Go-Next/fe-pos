// types/transaction.ts

// Interface untuk data transaksi list
export interface TransactionData {
  invoice_number: string;
  transaction_date: string;
  customer_name: string;
  doctor_name: string;
  cashier: string;
  total_items: number;
  sub_total: number;
  discount: number;
  grand_total: number;
  payment_type: string;
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
}

// Interface untuk payment details
export interface PaymentDetails {
  payment_type: string;
  amount_paid: number;
  change: number;
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
  sc: number;
  promo: number;
  grand_total: number;
  payment_details: PaymentDetails;
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

// Interface untuk parameters API transaksi - UPDATED
export interface TransactionApiParams {
  offset?: number;
  limit?: number;
  from_date?: string;
  to_date?: string;
}
