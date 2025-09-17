// app/create-order/choose-menu/page.tsx - FINAL VERSION WITH CTRL+SPACE FIX
"use client";

import OrderSummary from "@/components/shared/order-summary";
import TransactionInfo from "@/components/shared/transaction-info";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/useLogout";
import { usePOSKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useParameter } from "@/hooks/useParameter";
import type { StockData } from "@/types/stock";
import { ProductTableItem } from "@/types/stock";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { ProductTableSection } from "./_components";
import TransactionHistoryDialog from "./_components/TransactionHistoryDialog";
import StockWarningDialog from "@/components/shared/stock-warning-dialog";

interface CustomerData {
    id: number;
    name: string;
    gender: string;
    age: string;
    phone: string;
    address: string;
    status: string;
}

interface DoctorData {
    id: number;
    fullname: string;
    phone: string;
    address: string;
    fee_consultation?: number;
    sip: string;
}

export default function ChooseMenuPage() {
    const [isClient, setIsClient] = useState(false);
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerData | null>();
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(
        null
    );
    const [shouldFocusSearch, setShouldFocusSearch] = useState(true);
    const [shouldFocusQuantity, setShouldFocusQuantity] = useState(false);
    const [lastAddedProductId, setLastAddedProductId] = useState<number | null>(
        null
    );

    const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] =
        useState(false);

    // Stock Warning Dialog States
    const [stockWarningDialog, setStockWarningDialog] = useState({
        isOpen: false,
        productName: "",
        warningType: "out-of-stock" as "out-of-stock" | "insufficient-stock",
        availableStock: 0,
        requestedQuantity: 0,
    });

    const productSearchInputRef = useRef<HTMLInputElement>(null);
    const barcodeSearchInputRef = useRef<HTMLInputElement>(null);

    const { logout, isLoading: isLogoutLoading } = useLogout();
    const { parameterData } = useParameter();

    useEffect(() => {
        setIsClient(true);
        setIsTransactionHistoryOpen(false);
    }, []);

    const [products, setProducts] = useState<ProductTableItem[]>([]);
    const [nextId, setNextId] = useState(1);

    const getSCValueByType = (type: string): number => {
        if (!parameterData) return 0;

        switch (type) {
            case "R/":
                return parameterData.service || 0;
            case "RC":
                return parameterData.service_dokter || 0;
            default:
                return 0;
        }
    };

    // CRITICAL: Stock validation - only block products with q_akhir === 0
    const validateStock = (
        product: ProductTableItem,
        requestedQuantity: number
    ): boolean => {
        const stockData = product.stockData;
        if (!stockData) {
            return true; // If no stock data, allow (fallback)
        }

        const availableStock = stockData.q_akhir;

        console.log("🔍 VALIDATING STOCK:", {
            productName: product.name,
            availableStock,
            requestedQuantity,
        });

        // ONLY block if stock is exactly 0
        if (availableStock === 0) {
            console.log("❌ VALIDATION FAILED: Stock is exactly 0");
            setStockWarningDialog({
                isOpen: true,
                productName: product.name,
                warningType: "out-of-stock",
                availableStock: 0,
                requestedQuantity,
            });
            return false;
        }

        // Check if requested quantity exceeds available stock (only for positive numbers)
        if (
            availableStock &&
            availableStock > 0 &&
            requestedQuantity > availableStock
        ) {
            console.log(
                "❌ VALIDATION FAILED: Requested quantity exceeds stock"
            );
            setStockWarningDialog({
                isOpen: true,
                productName: product.name,
                warningType: "insufficient-stock",
                availableStock,
                requestedQuantity,
            });
            return false;
        }

        console.log("✅ VALIDATION PASSED: Stock is available");
        return true;
    };

    const handleMiscChange = (productId: number, miscAmount: number) => {
        if (!isClient) return;

        setProducts((prevProducts) =>
            prevProducts.map((product) => {
                if (product.id === productId) {
                    const updatedProduct = {
                        ...product,
                        misc: (product.misc || 0) + miscAmount,
                    };

                    // Recalculate total with new misc value
                    const dynamicSC = getSCValueByType(product.type || "");
                    updatedProduct.total =
                        (updatedProduct.subtotal || 0) +
                        dynamicSC +
                        updatedProduct.misc -
                        (updatedProduct.subtotal || 0) *
                            ((updatedProduct.discount || 0) / 100) -
                        (updatedProduct.promo || 0);

                    return updatedProduct;
                }
                return product;
            })
        );
    };

    useEffect(() => {
        if (shouldFocusSearch && isClient) {
            const timer = setTimeout(() => {
                const productSearchInput = document.querySelector(
                    'input[placeholder="Cari nama produk disini"]'
                ) as HTMLInputElement;
                if (productSearchInput) {
                    productSearchInput.focus();
                }
                setShouldFocusSearch(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [shouldFocusSearch, isClient]);

    useEffect(() => {
        if (shouldFocusQuantity && lastAddedProductId && isClient) {
            const timer = setTimeout(() => {
                const quantityInput = document.querySelector(
                    `input[data-product-id="${lastAddedProductId}"]`
                ) as HTMLInputElement;

                if (quantityInput) {
                    quantityInput.focus();
                    quantityInput.select();
                } else {
                    const allQuantityInputs = document.querySelectorAll(
                        'input[type="number"][data-product-id]'
                    );
                    const lastQuantityInput = allQuantityInputs[
                        allQuantityInputs.length - 1
                    ] as HTMLInputElement;
                    if (lastQuantityInput) {
                        lastQuantityInput.focus();
                        lastQuantityInput.select();
                    }
                }
                setShouldFocusQuantity(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [shouldFocusQuantity, lastAddedProductId, isClient, products]);

    const handleClearAllProducts = () => {
        setProducts([]);
        setNextId(1);
        setLastAddedProductId(null);
        setShouldFocusSearch(true);
    };

    const handleOpenTransactionHistory = () => {
        setIsTransactionHistoryOpen(true);
    };

    usePOSKeyboardShortcuts(
        {
            clearAllProducts: handleClearAllProducts,
        },
        {
            transactionHistory: handleOpenTransactionHistory,
        },
        {
            enabled: isClient,
            debug: false,
        }
    );

    useEffect(() => {
        if (isClient) {
            const savedProducts = localStorage.getItem("pos-products");
            const savedNextId = localStorage.getItem("pos-next-id");

            if (savedProducts) {
                try {
                    const parsedProducts = JSON.parse(savedProducts);
                    setProducts(parsedProducts);
                } catch (error) {
                    console.error("Error parsing saved products:", error);
                }
            }

            if (savedNextId) {
                try {
                    setNextId(parseInt(savedNextId));
                } catch (error) {
                    console.error("Error parsing saved next ID:", error);
                }
            }
        }
    }, [isClient]);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("pos-products", JSON.stringify(products));
            localStorage.setItem("pos-next-id", nextId.toString());
        }
    }, [products, nextId, isClient]);

    const handleLogout = async () => {
        await logout();
    };

    const totals = useMemo(() => {
        if (!isClient)
            return {
                subtotal: 0,
                misc: 0,
                serviceCharge: 0,
                discount: 0,
                promo: 0,
            };

        const filledProducts = products.filter((p) => p.name && p.quantity > 0);

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
    }, [products, isClient, parameterData]);

    const paymentProducts = useMemo(() => {
        return products
            .filter((p) => p.name && p.quantity > 0)
            .map((product) => ({
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: product.price || 0,
                subtotal: product.subtotal || 0,
                discount: product.discount || 0,
                sc: getSCValueByType(product.type || ""),
                misc: product.misc || 0,
                promo: product.promo || 0,
                total: product.total || 0,
                stockData: product.stockData,
                up: product.up,
            }));
    }, [products, parameterData]);

    // CRITICAL: Quantity change with stock validation
    const handleQuantityChange = (id: number, value: number) => {
        if (!isClient) return;

        const productToValidate = products.find((product) => product.id === id);
        if (!productToValidate) return;

        // Validate stock before updating
        if (!validateStock(productToValidate, value)) {
            return; // Don't update quantity if validation fails
        }

        // If validation passes, update the quantity
        setProducts(
            products.map((product) => {
                if (product.id === id) {
                    const newQuantity = value < 0 ? 0 : value;
                    const newSubtotal = (product.price || 0) * newQuantity;
                    const dynamicSC = getSCValueByType(product.type || "");

                    return {
                        ...product,
                        quantity: newQuantity,
                        subtotal: newSubtotal,
                        sc: dynamicSC,
                        total:
                            newSubtotal +
                            dynamicSC +
                            (product.misc || 0) -
                            newSubtotal * ((product.discount || 0) / 100) -
                            (product.promo || 0),
                    };
                }
                return product;
            })
        );
    };

    const handleQuantityBlur = () => {
        setTimeout(() => {
            setShouldFocusSearch(true);
        }, 100);
    };

    const handleQuantityKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
            setShouldFocusSearch(true);
        }
    };

    const handleTypeChange = (id: number, newType: string) => {
        setProducts((prevProducts) =>
            prevProducts.map((product) => {
                if (product.id === id) {
                    const newSCValue = getSCValueByType(newType);

                    const updatedProduct = {
                        ...product,
                        type: newType,
                        sc: newSCValue,
                    };

                    updatedProduct.total =
                        (updatedProduct.subtotal || 0) +
                        newSCValue +
                        (updatedProduct.misc || 0) -
                        (updatedProduct.subtotal || 0) *
                            ((updatedProduct.discount || 0) / 100) -
                        (updatedProduct.promo || 0);

                    return updatedProduct;
                }
                return product;
            })
        );
    };

    const handleDiscountChange = (
        productId: number,
        discountPercentage: number
    ) => {
        if (!isClient) return;

        setProducts((prevProducts) =>
            prevProducts.map((product) => {
                if (product.id === productId) {
                    const discountAmount =
                        (product.subtotal || 0) * (discountPercentage / 100);
                    const dynamicSC = getSCValueByType(product.type || "");
                    const newTotal =
                        (product.subtotal || 0) +
                        dynamicSC +
                        (product.misc || 0) -
                        discountAmount -
                        (product.promo || 0);

                    return {
                        ...product,
                        discount: discountPercentage,
                        sc: dynamicSC,
                        total: Math.max(0, newTotal),
                    };
                }
                return product;
            })
        );
    };

    const handleRemoveProduct = (id: number) => {
        if (!isClient) return;
        setProducts(products.filter((product) => product.id !== id));
        setShouldFocusSearch(true);
    };

    const handleProductNameClick = (id: number) => {
        console.log(`Product name clicked for ID: ${id}`);
    };

    const convertStockToProduct = (stockData: StockData): ProductTableItem => {
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

    // CRITICAL: Product selection with stock validation
    const handleProductSelect = (
        selectedStockData: StockData,
        productId: number
    ) => {
        console.log("🛒 ADDING PRODUCT TO CART:", {
            productName: selectedStockData.nama_brg,
            stock: selectedStockData.q_akhir,
        });

        // ONLY block if stock is exactly 0
        const availableStock = selectedStockData.q_akhir;

        if (availableStock === 0) {
            console.log("❌ BLOCKED: Cannot add product with zero stock");
            setStockWarningDialog({
                isOpen: true,
                productName: selectedStockData.nama_brg,
                warningType: "out-of-stock",
                availableStock: 0,
                requestedQuantity: 1,
            });
            return; // STOP execution here
        }

        // Allow adding to cart for all other cases
        console.log("✅ ALLOWED: Adding product to cart");
        const newProduct = convertStockToProduct(selectedStockData);
        setProducts((prevProducts) => [...prevProducts, newProduct]);
        setLastAddedProductId(nextId);
        setNextId((prevId) => prevId + 1);
        setShouldFocusQuantity(true);
    };

    const handlePendingBill = () => {
        handleClearAllProducts();
    };

    const handlePayNow = (
        customerData?: CustomerData,
        doctorData?: DoctorData
    ) => {
        console.log("Payment completed from OrderSummary flow - clearing cart");
        handleClearAllProducts();
    };

    const handleStockWarningClose = () => {
        setStockWarningDialog((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    if (!isClient) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="flex flex-1 gap-6 p-5">
                <div className="w-4/5 overflow-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                disabled={isLogoutLoading}
                                className="flex items-center text-gray-800 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                <ArrowLeft className="mr-2" size={20} />
                                <h1 className="text-lg font-semibold">
                                    POS Transaction
                                </h1>
                            </button>
                            <div className="flex-grow flex justify-end ml-4">
                                <div className="relative w-full max-w-md">
                                    <Input
                                        ref={barcodeSearchInputRef}
                                        type="text"
                                        placeholder="Scan or Search Barcode"
                                        className="pl-10 bg-[#F5F5F5] border-none py-5"
                                    />
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#202325]"
                                        size={18}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <ProductTableSection
                        products={products}
                        onQuantityChange={handleQuantityChange}
                        onQuantityBlur={handleQuantityBlur}
                        onQuantityKeyPress={handleQuantityKeyPress}
                        onRemoveProduct={handleRemoveProduct}
                        onProductNameClick={handleProductNameClick}
                        onProductSelect={handleProductSelect}
                        onTypeChange={handleTypeChange}
                        onDiscountChange={handleDiscountChange}
                        onMiscChange={handleMiscChange}
                        className="mb-6"
                    />
                </div>

                <div className="w-1/5">
                    <div className="p-5 bg-white shadow-md overflow-auto w-full rounded-2xl">
                        <TransactionInfo
                            useRealTimeData={true}
                            className="mb-6"
                        />

                        <OrderSummary
                            subtotal={totals.subtotal}
                            misc={totals.misc}
                            serviceCharge={totals.serviceCharge}
                            discount={totals.discount}
                            promo={totals.promo}
                            products={paymentProducts}
                            onPendingBill={handlePendingBill}
                            onPayNow={handlePayNow}
                        />
                    </div>
                </div>
            </div>

            <TransactionHistoryDialog
                isOpen={isTransactionHistoryOpen}
                onClose={() => {
                    setIsTransactionHistoryOpen(false);
                }}
            />

            {/* CRITICAL: Stock Warning Dialog - shows when trying to add/modify products with insufficient stock */}
            <StockWarningDialog
                isOpen={stockWarningDialog.isOpen}
                onClose={handleStockWarningClose}
                productName={stockWarningDialog.productName}
                warningType={stockWarningDialog.warningType}
                availableStock={stockWarningDialog.availableStock}
                requestedQuantity={stockWarningDialog.requestedQuantity}
            />
        </div>
    );
}
