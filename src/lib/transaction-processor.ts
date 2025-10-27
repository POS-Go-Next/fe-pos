import { buildTransactionPayload } from "./transaction-utils";
import type { ProductTableItem } from "@/types/stock";
import type { TransactionData, TransactionItem } from "@/types/transaction";

export interface TransactionProcessorCustomerData {
  id: string;
  name?: string;
  phone?: string;
}

export interface TransactionProcessorDoctorData {
  id: string;
  fullname?: string;
}

export interface TransactionProcessorPaymentInfo {
  cash: number;
  changeCash: number;
  changeCC: number;
  changeDC: number;
  credit: number;
  debit: number;
  creditAccountNumber?: string | null;
  debitAccountNumber?: string | null;
  creditEDCMachine?: string | null;
  debitEDCMachine?: string | null;
  creditBank?: string | null;
  debitBank?: string | null;
  creditCardType?: string | null;
  debitCardType?: string | null;
}

export interface TransactionProcessorTotals {
  subTotal: number;
  totalMisc: number;
  totalServiceFee: number;
  totalDiscount: number;
  totalPromo: number;
  correctTotalAmount: number;
}

export interface TransactionProcessorTransactionTypeData {
  medicineType?: string;
  transactionType?: string;
  availability?: string;
}

// Regular transaction options
export interface RegularTransactionOptions {
  type: "regular";
  products: ProductTableItem[];
  customerData: TransactionProcessorCustomerData;
  doctorData?: TransactionProcessorDoctorData | null;
  paymentInfo: TransactionProcessorPaymentInfo;
  totals: TransactionProcessorTotals;
  transactionTypeData?: TransactionProcessorTransactionTypeData | null;
  notes?: string;
}

// Item-based return transaction options
export interface ItemBasedReturnTransactionOptions {
  type: "item-based-return";
  products: ProductTableItem[];
  customerData: TransactionProcessorCustomerData;
  doctorData?: TransactionProcessorDoctorData | null;
  paymentInfo: TransactionProcessorPaymentInfo;
  totals: TransactionProcessorTotals;
  transactionTypeData?: TransactionProcessorTransactionTypeData | null;
  returnReason?: string;
  originalInvoiceNumber: string; // Use existing invoice number for item-based returns
  notes?: string;
}

// Full return transaction options
export interface FullReturnTransactionOptions {
  type: "full-return";
  originalTransactionData: TransactionData;
  originalProducts?: ProductTableItem[];
  returnReason?: string;
}

export type TransactionProcessorOptions = 
  | RegularTransactionOptions 
  | ItemBasedReturnTransactionOptions 
  | FullReturnTransactionOptions;

export interface TransactionProcessorResult {
  success: boolean;
  data?: unknown;
  message?: string;
}

// System info utilities
const getSystemInfo = async (): Promise<string | null> => {
  try {
    const response = await fetch("http://localhost:8321/api/system/info");
    const data = await response.json();

    if (data.success && data.data.deviceConfig?.deviceId) {
      return data.data.deviceConfig.deviceId;
    }
    return null;
  } catch (error) {
    console.error("Error getting system info:", error);
    return null;
  }
};

const getNextInvoice = async (transactionType: string): Promise<string> => {
  try {
    const response = await fetch(`/api/transaction/next-invoice?transaction_type=${transactionType}`);
    const data = await response.json();
    return data.data?.invoice_number || "S25080315";
  } catch (error) {
    console.error("Error getting next invoice:", error);
    return "S25080315";
  }
};

const getTransactionType = async (deviceId: string): Promise<string> => {
  try {
    const response = await fetch(`/api/kassa/${deviceId}`);
    const data = await response.json();
    return data.success ? data.data?.default_jual || "1" : "1";
  } catch (error) {
    console.error("Error getting transaction type:", error);
    return "1";
  }
};

/**
 * Unified transaction processor that ensures all transaction types use consistent payload structure
 */
export const processTransaction = async (
  options: TransactionProcessorOptions
): Promise<TransactionProcessorResult> => {
  try {
    // Get system information
    const deviceId = await getSystemInfo();

    if (!deviceId) {
      throw new Error("Unable to get system device ID. Please try again.");
    }

    const transactionType = await getTransactionType(deviceId);

    let invoiceNumber = "";
    
    if (options.type === "regular") {
      invoiceNumber = await getNextInvoice(transactionType);
    }// For full-return, invoice number comes from original transaction data

    // Build payload based on transaction type
    let payload;

    if (options.type === "regular") {
      payload = buildTransactionPayload({
        deviceId,
        invoiceNumber,
        customerData: { id: options.customerData.id },
        doctorData: options.doctorData ? { id: options.doctorData.id } : null,
        transactionType,
        transactionAction: "1", // Regular transaction
        products: options.products,
        paymentInfo: options.paymentInfo,
        totals: options.totals,
        transactionTypeData: options.transactionTypeData,
        notes: options.notes,
        needPrintInvoice: false,
      });
    } else if (options.type === "item-based-return") {
      payload = buildTransactionPayload({
        deviceId,
        invoiceNumber: options.originalInvoiceNumber, // Use original invoice number for item-based returns
        customerData: { id: options.customerData.id },
        doctorData: options.doctorData ? { id: options.doctorData.id } : null,
        transactionType,
        transactionAction: "2", // Item-based return
        products: options.products,
        paymentInfo: options.paymentInfo,
        totals: options.totals,
        transactionTypeData: options.transactionTypeData,
        returnInfo: {
          isReturnTransaction: true,
          returnReason: options.returnReason || "Item-based return",
          confirmationBy: "cashier",
        },
        notes: options.notes,
        needPrintInvoice: false,
      });
    } else if (options.type === "full-return") {
      // For full returns, create comprehensive payload using original transaction data
      const originalData = options.originalTransactionData;
      
      payload = buildTransactionPayload({
        deviceId,
        invoiceNumber: originalData.invoice_number,
        customerData: { id: originalData.customer_id },
        doctorData: originalData.doctor_id ? { id: originalData.doctor_id.toString() } : null,
        transactionType: originalData.transaction_type,
        transactionAction: "0", // Full return
        products: options.originalProducts || [], // Include original products if available
        paymentInfo: {
          cash: 0,
          changeCash: 0,
          changeCC: 0,
          changeDC: 0,
          credit: 0,
          debit: 0,
          creditAccountNumber: null,
          debitAccountNumber: null,
          creditEDCMachine: null,
          debitEDCMachine: null,
          creditBank: null,
          debitBank: null,
          creditCardType: null,
          debitCardType: null,
        },
        totals: {
          subTotal: 0,
          totalMisc: 0,
          totalServiceFee: 0,
          totalDiscount: 0,
          totalPromo: 0,
          correctTotalAmount: 0,
        },
        transactionTypeData: {
          medicineType: originalData.compounded ? "Compounded" : "Ready to Use",
          transactionType: originalData.full_prescription ? "Full Prescription" : "Partial Prescription",
          availability: originalData.availability ? "Available" : "Patient Credit",
        },
        returnInfo: {
          isReturnTransaction: true,
          returnReason: options.returnReason || "Customer request",
          confirmationBy: "2",
        },
        notes: originalData.notes,
        needPrintInvoice: false,
      });

      // Override the items with original transaction items but with zero quantities
      payload.items = originalData.items.map((item: TransactionItem) => ({
        transaction_action: "0",
        product_code: item.product_code,
        quantity: -item.quantity, // Zero quantity for full return
        sub_total: 0,
        nominal_discount: 0,
        discount: 0,
        service_fee: 0,
        misc: 0,
        disc_promo: 0,
        value_promo: 0,
        no_promo: "",
        promo_type: item.promo_type || "",
        up_selling: item.up_selling,
        total: 0,
        round_up: 0,
        prescription_code: item.prescription_code || "",
      }));
    } else {
      // This should never happen with proper TypeScript types
      throw new Error("Unknown transaction type provided");
    }

    // Make API call
    const response = await fetch("/api/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      let errorMessage = "Transaction failed. Please try again.";

      if (result.message) {
        errorMessage = result.message;
      } else if (response.status === 400) {
        errorMessage = "Invalid transaction data. Please check all fields.";
      } else if (response.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      throw new Error(errorMessage);
    }

    return {
      success: true,
      data: result,
      message: "Transaction processed successfully",
    };
  } catch (error) {
    console.error("Transaction processing error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};