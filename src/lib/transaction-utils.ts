import type { StockData } from "@/types/stock";
import { ProductTableItem } from "@/types/stock";
import type { TransactionItem } from "@/types/transaction";

// Simple product item interface (for payment dialog)
export interface ProductItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount: number;
  sc: number;
  misc: number;
  promo: number;
  total: number;
  stockData?: {
    kode_brg: string;
  };
  up?: string;
}

export interface TransactionPageConfig {
  isReturnTransaction: boolean;
  storageKeys: {
    PRODUCTS: string;
    NEXT_ID: string;
  };
  pageTitle: string;
  pageIcon?: React.ComponentType<{ className?: string; size?: number }>;
  backgroundColor: string;
  borderColor: string;
}

export const REGULAR_TRANSACTION_CONFIG: TransactionPageConfig = {
  isReturnTransaction: false,
  storageKeys: {
    PRODUCTS: "pos-products",
    NEXT_ID: "pos-next-id",
  },
  pageTitle: "POS Transaction",
  backgroundColor: "from-blue-50 to-white",
  borderColor: "border-gray-100",
};

export const RETURN_TRANSACTION_CONFIG: TransactionPageConfig = {
  isReturnTransaction: true,
  storageKeys: {
    PRODUCTS: "return-pos-products",
    NEXT_ID: "return-pos-next-id",
  },
  pageTitle: "Return Transaction",
  backgroundColor: "from-orange-50 to-white",
  borderColor: "border-orange-200",
};

export interface TransactionPageState {
  isClient: boolean;
  shouldFocusSearch: boolean;
  shouldFocusQuantity: boolean;
  lastAddedProductId: number | null;
  isTransactionHistoryOpen: boolean;
  isTransactionCorrectionOpen: boolean;
  stockWarningDialog: {
    isOpen: boolean;
    productName: string;
    warningType: "out-of-stock" | "insufficient-stock";
    availableStock: number;
    requestedQuantity: number;
  };
  calculatorModal: {
    isOpen: boolean;
    targetProductId: number | null;
    currentValue: string;
  };
  pendingAction: {
    type: "quantity-change";
    data: { productId: number; newQuantity: number };
  } | {
    type: "product-select";
    data: { stockData: StockData };
  } | null;
  quantityValidationTimeout: ReturnType<typeof setTimeout> | null;
  triggerPayNow: boolean;
  products: ProductTableItem[];
  nextId: number;
  returnTransactionInfo: {
    customerName?: string;
    doctorName?: string;
    invoiceNumber?: string;
    isReturnTransaction: boolean;
  };
}

export const createInitialTransactionState = (config: TransactionPageConfig): TransactionPageState => ({
  isClient: false,
  shouldFocusSearch: true,
  shouldFocusQuantity: false,
  lastAddedProductId: null,
  isTransactionHistoryOpen: false,
  isTransactionCorrectionOpen: false,
  stockWarningDialog: {
    isOpen: false,
    productName: "",
    warningType: "out-of-stock",
    availableStock: 0,
    requestedQuantity: 0,
  },
  calculatorModal: {
    isOpen: false,
    targetProductId: null,
    currentValue: "",
  },
  pendingAction: null,
  quantityValidationTimeout: null,
  triggerPayNow: false,
  products: [],
  nextId: 1,
  returnTransactionInfo: {
    isReturnTransaction: config.isReturnTransaction,
  },
});

export const convertStockToProduct = (stockData: StockData, nextId: number): ProductTableItem => {
  return {
    id: nextId,
    name: stockData.nama_brg,
    type: "",
    price: stockData.hj_ecer || 0,
    quantity: 1,
    subtotal: stockData.hj_ecer || 0,
    discount: 0,
    sc: 0,
    misc: 0,
    promo: 0,
    promoPercent: 0,
    up: "N",
    noVoucher: 0,
    total: stockData.hj_ecer || 0,
    stockData: stockData,
  };
};

export const convertTransactionItemToProduct = (item: TransactionItem, itemId: number): ProductTableItem => {
  return {
    id: itemId,
    name: item.product_name || item.product_code,
    type: item.prescription_code?.trim() || "",
    price: item.price,
    quantity: item.quantity,
    subtotal: item.sub_total,
    discount: item.nominal_discount,
    sc: item.service_fee,
    misc: item.misc,
    promo: item.disc_promo,
    promoPercent: item.value_promo,
    up: item.up_selling,
    noVoucher: 0,
    total: item.total,
    stockData: {
      kode_brg: item.product_code,
      nama_brg: item.product_name,
      hj_ecer: item.price,
      // Minimal properties for dialogs to work - other properties can be undefined/default
      id_dept: "",
      isi: 1,
      id_satuan: 0,
      strip: 1,
      mark_up: 0,
      hb_netto: 0,
      hb_gross: 0,
      hj_bbs: 0,
      id_kategori: "",
      id_pabrik: "",
      barcode: "",
      q_bbs: 0,
      satuan: "",
      hna: 0,
    },
    isOriginalReturnItem: true,
    isDeleted: false,
  };
};

export const calculateTotals = (
  products: ProductTableItem[],
  getSCValueByType: (type: string) => number,
  isClient: boolean
) => {
  if (!isClient)
    return {
      subtotal: 0,
      misc: 0,
      serviceCharge: 0,
      discount: 0,
      promo: 0,
    };

  const filledProducts = products.filter((p) => p.name && p.quantity > 0 && !(p.isOriginalReturnItem && p.isDeleted));

  const subtotal = filledProducts.reduce(
    (sum, product) => sum + (product.subtotal || 0),
    0
  );
  const misc = filledProducts.reduce(
    (sum, product) => sum + (product.misc || 0),
    0
  );
  const serviceCharge = filledProducts.reduce(
    (sum, product) => sum + getSCValueByType(product.type || ""),
    0
  );
  const discount = filledProducts.reduce(
    (sum, product) =>
      sum + (product.subtotal || 0) * ((product.discount || 0) / 100),
    0
  );
  const promo = filledProducts.reduce(
    (sum, product) => sum + (product.promo || 0),
    0
  );

  return {
    subtotal,
    misc,
    serviceCharge,
    discount,
    promo,
  };
};

export const loadTransactionFromStorage = (config: TransactionPageConfig) => {
  const savedProducts = localStorage.getItem(config.storageKeys.PRODUCTS);
  const savedNextId = localStorage.getItem(config.storageKeys.NEXT_ID);

  let products: ProductTableItem[] = [];
  let nextId = 1;

  if (savedProducts) {
    try {
      const parsedProducts = JSON.parse(savedProducts);
      // Ensure all products have the new properties for return transactions
      products = parsedProducts.map((product: ProductTableItem) => ({
        ...product,
        // Add fallback values for missing properties
        isOriginalReturnItem: product.isOriginalReturnItem ?? false,
        isDeleted: product.isDeleted ?? false,
      }));
    } catch (error) {
      console.error("Error parsing saved products:", error);
    }
  }

  if (savedNextId) {
    try {
      nextId = parseInt(savedNextId);
    } catch (error) {
      console.error("Error parsing saved next ID:", error);
    }
  }

  return { products, nextId };
};

export const saveTransactionToStorage = (
  config: TransactionPageConfig,
  products: ProductTableItem[],
  nextId: number
) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(config.storageKeys.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(config.storageKeys.NEXT_ID, nextId.toString());
  }
};

export const clearTransactionStorage = (config: TransactionPageConfig) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(config.storageKeys.PRODUCTS, "[]");
    localStorage.setItem(config.storageKeys.NEXT_ID, "1");
  }
};

// Transaction payload builder types
export interface TransactionPaymentInfo {
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

export interface TransactionCustomerInfo {
  id: string;
}

export interface TransactionDoctorInfo {
  id: string;
}

export interface TransactionTypeInfo {
  medicineType?: string;
  transactionType?: string;
  availability?: string;
}

export interface TransactionReturnInfo {
  isReturnTransaction?: boolean;
  returnReason?: string;
  confirmationBy?: string;
}

export interface TransactionPayload {
  device_id: string;
  invoice_number: string;
  notes: string;
  customer_id: number;
  doctor_id: number | null;
  corporate_code: string | null;
  transaction_type: string;
  transaction_action: string;
  need_print_invoice: boolean;
  items: Array<{
    transaction_action: string;
    product_code: string;
    quantity: number;
    sub_total: number;
    nominal_discount: number;
    discount: number;
    service_fee: number;
    misc: number;
    disc_promo: number;
    value_promo: number;
    no_promo: string;
    promo_type: string;
    up_selling: string;
    total: number;
    round_up: number;
    prescription_code?: string;
  }>;
  cash: number;
  change_cash: number;
  change_cc: number;
  change_dc: number;
  credit_card: number;
  debit_card: number;
  no_cc: string | null;
  no_dc: string | null;
  edc_cc: string | null;
  edc_dc: string | null;
  publisher_cc: string | null;
  publisher_dc: string | null;
  type_cc: string | null;
  type_dc: string | null;
  compunded: boolean;
  full_prescription: boolean;
  availability: boolean;
  sub_total: number;
  misc: number;
  service_fee: number;
  discount: number;
  promo: number;
  round_up: number;
  grand_total: number;
  retur_reason?: string;
  confirmation_retur_by?: string;
}

export interface TransactionTotals {
  subTotal: number;
  totalMisc: number;
  totalServiceFee: number;
  totalDiscount: number;
  totalPromo: number;
  correctTotalAmount: number;
}

export interface TransactionPayloadOptions {
  deviceId: string;
  invoiceNumber: string;
  customerData: TransactionCustomerInfo;
  doctorData?: TransactionDoctorInfo | null;
  transactionType: string;
  transactionAction: string;
  products: ProductTableItem[] | ProductItem[];
  paymentInfo: TransactionPaymentInfo;
  totals: TransactionTotals;
  transactionTypeData?: TransactionTypeInfo | null;
  returnInfo?: TransactionReturnInfo;
  notes?: string;
  corporateCode?: string | null;
  needPrintInvoice?: boolean;
}

export const buildTransactionItems = (
  products: ProductTableItem[] | ProductItem[],
  transactionType: string,
  transactionAction: string,
  transactionTypeData?: TransactionTypeInfo
) => {
  return products.map((product) => {
    const nominalDiscount =
      (product.subtotal || 0) * ((product.discount || 0) / 100);

    const finalTotal = Math.max(
      0,
      (product.subtotal || 0) +
        (product.sc || 0) +
        (product.misc || 0) -
        nominalDiscount -
        (product.promo || 0)
    );

    const itemData: {
      transaction_action: string;
      product_code: string;
      quantity: number;
      sub_total: number;
      nominal_discount: number;
      discount: number;
      service_fee: number;
      misc: number;
      disc_promo: number;
      value_promo: number;
      no_promo: string;
      promo_type: string;
      up_selling: string;
      total: number;
      round_up: number;
      prescription_code?: string;
    } = {
      transaction_action: transactionAction,
      product_code: product.stockData?.kode_brg || "",
      quantity: product.quantity,
      sub_total: product.subtotal || 0,
      nominal_discount: nominalDiscount,
      discount: product.discount || 0,
      service_fee: product.sc || 0,
      misc: product.misc || 0,
      disc_promo: 0,
      value_promo: product.promo || 0,
      no_promo: "",
      promo_type: "1",
      up_selling: product.up === "Y" ? "Y" : "N",
      total: finalTotal,
      round_up: 0,
    };

    if (transactionType === "2") {
      itemData.prescription_code =
        transactionTypeData?.medicineType === "Compounded" ? "RC" : "R/";
    }

    return itemData;
  });
};

export const buildTransactionPayload = (options: TransactionPayloadOptions): TransactionPayload => {
  const {
    deviceId,
    invoiceNumber,
    customerData,
    doctorData,
    transactionType,
    transactionAction,
    products,
    paymentInfo,
    totals,
    transactionTypeData,
    returnInfo,
    notes = "",
    corporateCode = null,
    needPrintInvoice = false,
  } = options;

  const basePayload: TransactionPayload = {
    device_id: deviceId,
    invoice_number: invoiceNumber,
    notes,
    // customer_id: customerData.id,
    customer_id: parseInt(customerData.id),
    doctor_id: doctorData ? parseInt(doctorData.id) : null,
    corporate_code: corporateCode,
    transaction_type: transactionType,
    transaction_action: transactionAction,
    need_print_invoice: needPrintInvoice,

    items: buildTransactionItems(products, transactionType, transactionAction, transactionTypeData || undefined),
    cash: paymentInfo.cash,
    change_cash: paymentInfo.changeCash,
    change_cc: paymentInfo.changeCC,
    change_dc: paymentInfo.changeDC,
    credit_card: paymentInfo.credit,
    debit_card: paymentInfo.debit,
    no_cc: paymentInfo.creditAccountNumber || null,
    no_dc: paymentInfo.debitAccountNumber || null,
    edc_cc: paymentInfo.creditEDCMachine || null,
    edc_dc: paymentInfo.debitEDCMachine || null,
    publisher_cc: paymentInfo.creditBank || null,
    publisher_dc: paymentInfo.debitBank || null,
    type_cc: paymentInfo.creditCardType || null,
    type_dc: paymentInfo.debitCardType || null,

    compunded: transactionTypeData?.medicineType === "Compounded",
    full_prescription: transactionTypeData?.transactionType === "Full Prescription",
    availability: transactionTypeData?.availability === "Available",

    sub_total: totals.subTotal,
    misc: totals.totalMisc,
    service_fee: totals.totalServiceFee,
    discount: totals.totalDiscount,
    promo: totals.totalPromo,
    round_up: 0,
    grand_total: totals.correctTotalAmount,
  };

  // Add return-specific fields if this is a return transaction
  if (returnInfo?.isReturnTransaction) {
    basePayload.retur_reason = returnInfo.returnReason || "Item-based return";
    basePayload.confirmation_retur_by = returnInfo.confirmationBy || "cashier";
  }

  return basePayload;
};