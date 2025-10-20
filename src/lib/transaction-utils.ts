import type { StockData } from "@/types/stock";
import { ProductTableItem } from "@/types/stock";
import type { TransactionItem } from "@/types/transaction";

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