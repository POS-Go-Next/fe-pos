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
  isDeleted?: boolean;
  isOriginalReturnItem?: boolean;
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
      invoiceNumber?: string;
      isReturnTransaction: boolean;
      confirmationReturBy?: string;
      originalTransactionType?: string;
      returnReason?: string;
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
     discountPercentage: 0,
     nominalDiscount: 0,
     sc: 0,
     misc: 0,
     promo: 0,
     discPromo: 0,
     valuePromo: 0,
     noPromo: "",
     promoType: "1",
     promoPercent: 0,
     roundUp: 0,
     up: "N",
     noVoucher: 0,
     total: stockData.hj_ecer || 0,
     stockData: stockData,
   };
};

export const convertTransactionItemToProduct = (item: TransactionItem, itemId: number): ProductTableItem => {
   // For return items loaded from original transactions, load with POSITIVE quantities initially
   // They become negative only when user explicitly deletes/returns them
   const quantity = Math.abs(item.quantity);
   const subtotal = Math.abs(item.sub_total);
   const sc = Math.abs(item.service_fee);
   const misc = Math.abs(item.misc);
   const total = Math.abs(item.total);

   return {
     id: itemId,
     name: item.product_name || item.product_code,
     type: item.prescription_code?.trim() || "",
     price: item.price,
     quantity: quantity,
     subtotal: subtotal,
     
     // Discount fields - BOTH are needed for round-trip conversion
     discountPercentage: Math.abs(item.discount || 0),        // Percentage (0-100)
     nominalDiscount: Math.abs(item.nominal_discount || 0),   // Fixed amount
     discount: Math.abs(item.nominal_discount || 0),          // DEPRECATED: for backward compatibility
     
     sc: sc,
     misc: misc,
     
     // Promo fields - ALL fields needed for complete mapping
     discPromo: Math.abs(item.disc_promo || 0),              // Promo discount amount
     valuePromo: Math.abs(item.value_promo || 0),            // Promo value/amount
     noPromo: item.no_promo || "",                            // Promo identifier
     promoType: item.promo_type || "1",                       // Promo type code
     promo: Math.abs(item.disc_promo || 0),                  // DEPRECATED: for backward compatibility
     promoPercent: item.value_promo,                         // DEPRECATED: for backward compatibility
     
     // Round-up
     roundUp: Math.abs(item.round_up || 0),                  // Per-item round-up
     
     up: item.up_selling,
     noVoucher: 0,
     total: total,
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

export const convertProductToReturnItem = (product: ProductTableItem): ProductTableItem => {
    // Convert a product item to a return item by negating all quantity-based values
    return {
      ...product,
      quantity: -Math.abs(product.quantity),
      subtotal: -Math.abs(product.subtotal),
      // Negate discount fields (both percentage and nominal)
      discount: product.discount !== undefined ? -Math.abs(product.discount) : undefined,
      discountPercentage: product.discountPercentage !== undefined ? product.discountPercentage : undefined, // Keep percentage positive (it's a rate, not an amount)
      nominalDiscount: product.nominalDiscount !== undefined ? -Math.abs(product.nominalDiscount) : undefined,
      sc: -Math.abs(product.sc),
      misc: -Math.abs(product.misc),
      // Negate promo fields (discount amounts should be negative, but percentages/rates stay positive)
      promo: product.promo !== undefined ? -Math.abs(product.promo) : undefined,
      discPromo: product.discPromo !== undefined ? -Math.abs(product.discPromo) : undefined,
      valuePromo: product.valuePromo !== undefined ? product.valuePromo : undefined, // Keep as-is (it's a rate/value)
      roundUp: product.roundUp !== undefined ? -Math.abs(product.roundUp) : undefined,
      total: product.total !== undefined ? -Math.abs(product.total) : undefined,
    };
  };

export const calculateTotals = (
   products: ProductTableItem[],
   getSCValueByType: (type: string) => number,
   isClient: boolean,
   isReturnTransaction: boolean = false
) => {
   if (!isClient)
     return {
       subtotal: 0,
       misc: 0,
       serviceCharge: 0,
       discount: 0,
       promo: 0,
       totRetJu: 0,
     };

   // For regular transactions: include only positive quantities and exclude deleted items
   // For mixed/return transactions: include both positive and negative quantities
   const filledProducts = products.filter((p) => {
     if (!p.name) return false;
     // Skip original return items that are NOT deleted (isOriginalReturnItem && !isDeleted)
     if (p.isOriginalReturnItem && !p.isDeleted) return false;
     // Include items with any non-zero quantity (positive or negative)
     // This includes: isOriginalReturnItem && isDeleted items (calculated as minus)
     return p.quantity !== 0;
   });

   const subtotal = filledProducts.reduce(
     (sum, product) => sum + (product.subtotal || 0),
     0
   );
   const misc = filledProducts.reduce(
     (sum, product) => sum + (product.misc || 0),
     0
   );
    const serviceCharge = filledProducts.reduce(
      (sum, product) => {
        const scValue = getSCValueByType(product.type || "");
        // Apply sign of quantity to service charge (negative for returned items)
        const quantitySign = product.quantity < 0 ? -1 : 1;
        return sum + (scValue * quantitySign);
      },
      0
    );
   const discount = filledProducts.reduce(
     (sum, product) => {
       // Use discountPercentage (new field) with fallback to discount (deprecated) for consistency
       const discountPercentage = (product as ProductTableItem).discountPercentage ?? (product.discount || 0);
       return sum + (product.subtotal || 0) * (discountPercentage / 100);
     },
     0
   );
   const promo = filledProducts.reduce(
     (sum, product) => sum + (product.promo || 0),
     0
   );

    // Calculate totRetJu (total return jual) for return transactions
    // For return transactions only: sum of items with negative quantities (returned items)
    // This represents the positive amount being returned/refunded
    let totRetJu = 0;
    if (isReturnTransaction) {
      totRetJu = filledProducts
        .filter((p) => p.quantity < 0) // Only items being returned (negative quantities)
        .reduce((sum, product) => {
          // Returned items have negative totals (negative quantity * price)
          // We need the absolute value for totRetJu (positive amount)
          return sum + Math.abs(product.total || 0);
        }, 0);
    }

    return {
      subtotal,
      misc,
      serviceCharge,
      discount,
      promo,
      totRetJu,
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
      // and add backward compatibility for discount/promo fields
      products = parsedProducts.map((product: ProductTableItem) => {
        const baseProduct: ProductTableItem = {
          ...product,
          // Add fallback values for missing properties
          isOriginalReturnItem: product.isOriginalReturnItem ?? false,
          isDeleted: product.isDeleted ?? false,
        };

        // Ensure new discount fields are present with backward compatibility
        if (!baseProduct.discountPercentage && baseProduct.discount !== undefined) {
          baseProduct.discountPercentage = baseProduct.discount;
        }
        if (!baseProduct.nominalDiscount) {
          baseProduct.nominalDiscount = 0;
        }

        // Ensure new promo fields are present with backward compatibility
        if (!baseProduct.discPromo && baseProduct.promo !== undefined) {
          baseProduct.discPromo = baseProduct.promo;
        }
        if (!baseProduct.valuePromo) {
          baseProduct.valuePromo = 0;
        }
        if (!baseProduct.noPromo) {
          baseProduct.noPromo = "";
        }
        if (!baseProduct.promoType) {
          baseProduct.promoType = "1";
        }

        // Ensure round-up field is present
        if (!baseProduct.roundUp) {
          baseProduct.roundUp = 0;
        }

        return baseProduct;
      });
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
  confirmationReturBy?: string;
  invoiceNumber?: string;
  originalTransactionType?: string;
}

/**
 * Validates that return transaction fields are not null or empty
 * @param returnInfo - The return transaction info to validate
 * @returns An error message if validation fails, null if valid
 */
export const validateReturnInfo = (
  returnInfo: TransactionReturnInfo | undefined
): string | null => {
  if (!returnInfo?.isReturnTransaction) {
    return null; // Not a return transaction, skip validation
  }

  const returnReason = returnInfo.returnReason?.trim();
  const confirmationReturBy = returnInfo.confirmationReturBy?.trim();

  if (!returnReason) {
    return "Return reason is required and cannot be empty.";
  }

  if (!confirmationReturBy) {
    return "Confirmation person is required and cannot be empty.";
  }

  return null;
};

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
   tot_retju?: number; // Total return jual: amount to be paid/refunded for return transactions
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
  totRetJu?: number; // Total return jual: for return transactions, this is the net amount to be paid/refunded
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
    const items = products.map((product) => {
       // Calculate nominal discount using dual discount fields
       // Try new fields first, fall back to deprecated fields for backward compatibility
       const discountPercentage = (product as ProductTableItem).discountPercentage ?? (product.discount || 0);
       const nominalDiscountField = (product as ProductTableItem).nominalDiscount ?? 0;
       
       // Calculate discount: use nominal if provided, otherwise calculate from percentage
       let nominalDiscount = nominalDiscountField;
       if (!nominalDiscountField && discountPercentage) {
         nominalDiscount = (product.subtotal || 0) * (discountPercentage / 100);
       }

       // Use promo fields from new interface
       const productItem = product as ProductTableItem;
       const discPromo = productItem.discPromo ?? (productItem.promo || 0);
       const valuePromo = productItem.valuePromo ?? 0;
       const noPromo = productItem.noPromo ?? "";
       const promoType = productItem.promoType ?? "1";
       const roundUpAmount = productItem.roundUp ?? 0;

       const finalTotal = Math.max(
         0,
         (product.subtotal || 0) +
           (product.sc || 0) +
           (product.misc || 0) -
           nominalDiscount -
           discPromo
       );

       // For item-based returns: transaction_action is "2" if isOriginalReturnItem && isDeleted, else "1"
       // For other transactions: use the passed transactionAction parameter
       let itemTransactionAction = transactionAction;
       const productItem2 = product as ProductTableItem;
       if (productItem2.isOriginalReturnItem && productItem2.isDeleted) {
         itemTransactionAction = "2";
       } else if (productItem2.isOriginalReturnItem || productItem2.isDeleted) {
         itemTransactionAction = "1";
       }

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
         transaction_action: itemTransactionAction,
         product_code: product.stockData?.kode_brg || "",
         quantity: product.quantity,
         sub_total: product.subtotal || 0,
         nominal_discount: nominalDiscount,
         discount: discountPercentage,
         service_fee: product.sc || 0,
         misc: product.misc || 0,
         disc_promo: discPromo,
         value_promo: valuePromo,
         no_promo: noPromo,
         promo_type: promoType,
         up_selling: product.up === "Y" ? "Y" : "N",
         total: finalTotal,
         round_up: roundUpAmount,
       };

      if (transactionType === "2") {
       // TODO: THIS IS SETTED BY FIELD IN THE FORM
        itemData.prescription_code =
          transactionTypeData?.medicineType === "Compounded" ? "RC" : "R/";
      }

      return itemData;
    });

     return items;
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

     // For return transactions:
     // - grand_total should be 0 (net of transaction with negative items)
     // - tot_retju holds the refund amount
     const isReturnTransaction = returnInfo?.isReturnTransaction ?? false;
     const finalGrandTotal = isReturnTransaction ? 0 : totals.correctTotalAmount;

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
      grand_total: finalGrandTotal,
      tot_retju: totals.totRetJu || 0, // Include totRetJu in payload
    };

     // Add return-specific fields if this is a return transaction
     if (isReturnTransaction && returnInfo) {
       // Validate return fields - throw error if null or empty
       if (!returnInfo.returnReason || !returnInfo.returnReason.trim()) {
         throw new Error("Return reason is required and cannot be empty");
       }
       if (!returnInfo.confirmationReturBy || !returnInfo.confirmationReturBy.trim()) {
         throw new Error("Confirmation person is required and cannot be empty");
       }
       
       basePayload.retur_reason = returnInfo.returnReason.trim();
       basePayload.confirmation_retur_by = returnInfo.confirmationReturBy.trim();
     }

    return basePayload;
};