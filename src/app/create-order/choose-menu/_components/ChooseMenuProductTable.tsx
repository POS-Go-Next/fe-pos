"use client";

import BranchWideStockDialog from "@/components/shared/branch-wide-stock-dialog";
import MedicationDetailsDialog from "@/components/shared/medication-details-dialog";
import ProductTypeSelector from "@/components/shared/ProductTypeSelector";
import SelectProductDialog from "@/components/shared/select-product-dialog";
import CustomerDoctorDialog from "@/components/shared/customer-doctor-dialog";
import AddCustomerDialog from "@/components/shared/add-customer-dialog";
import AddDoctorDialog from "@/components/shared/add-doctor-dialog";
import PaymentDialog from "@/components/shared/payment-dialog";
import TransactionTypeDialog from "@/components/shared/transaction-type-dialog";
import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import PaymentSuccessDialog from "@/components/shared/payment-success-dialog";
import Calculator from "@/components/shared/calculator";
import FingerprintScanningDialog from "@/components/shared/FingerprintScanningDialog";
import ProductHistoryDialog from "@/components/shared/product-history-dialog";

import { Input } from "@/components/ui/input";
import { usePOSKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useLogout } from "@/hooks/useLogout";
import { useParameter } from "@/hooks/useParameter";
import type { ProductTableItem } from "@/types/stock";
import { Plus, Trash } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import KeyboardShortcutGuide from "./KeyboardShortcutGuide";
import UpsellDialog from "./UpsellDialog";
import PrescriptionDiscountDialog from "./PrescriptionDiscountDialog";
import ChooseMiscDialog from "./ChooseMiscDialog";
import CorporateDiscountDialog from "./CorporateDiscountDialog";
import TransactionHistoryDialog from "./TransactionHistoryDialog";
import GlobalDiscountDialog from "./GlobalDiscountDialog";
import MonthlyPromoDialog from "./MonthlyPromoDialog";
import TransactionCorrectionDialog from "./TransactionCorrectionDialog";
import AddPendingBillDialog from "./AddPendingBillDialog";
import ViewPendingBillDialog from "./ViewPendingBillDialog";

export interface Product extends ProductTableItem {}

const formatCurrency = (amount: number | undefined | null): string => {
    if (amount == null || isNaN(Number(amount))) {
        return "Rp 0";
    }

    try {
        const numAmount = Number(amount);
        return `Rp ${numAmount.toLocaleString("id-ID")}`;
    } catch (error) {
        return "Rp 0";
    }
};

const ProductActionIcons = ({
    productName,
    onBranchStockClick,
    onMedicationDetailsClick,
    onDeleteClick,
    showIcons = true,
}: {
    productName: string;
    onBranchStockClick: () => void;
    onMedicationDetailsClick: () => void;
    onDeleteClick: () => void;
    showIcons?: boolean;
}) => {
    if (!showIcons) return null;

    return (
        <div className="flex items-center gap-2">
            <button
                className="w-8 h-8 bg-red-100 rounded flex items-center justify-center hover:bg-red-200 transition-colors cursor-pointer"
                onClick={onDeleteClick}
                title="Delete Product"
            >
                <Trash className="w-4 h-4 text-red-600" />
            </button>

            <button
                className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                onClick={onBranchStockClick}
                title="View Branch Wide Stock"
            >
                <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            </button>

            <button
                className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                onClick={onMedicationDetailsClick}
                title="View Medication Details"
            >
                <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </button>
        </div>
    );
};

interface ChooseMenuProductTableProps {
    products: ProductTableItem[];
    onQuantityChange: (id: number, quantity: number) => void;
    onQuantityBlur?: () => void;
    onQuantityKeyPress?: (e: React.KeyboardEvent) => void;
    onRemoveProduct: (id: number) => void;
    onProductNameClick?: (id: number) => void;
    onProductSelect?: (product: any, productId: number) => void;
    onTypeChange?: (id: number, type: string) => void;
    onDiscountChange?: (id: number, discount: number) => void;
    onMiscChange?: (id: number, miscAmount: number) => void;
    className?: string;
}

export default function ChooseMenuProductTable({
    products,
    onQuantityChange,
    onQuantityBlur,
    onQuantityKeyPress,
    onRemoveProduct,
    onProductNameClick,
    onProductSelect,
    onTypeChange,
    onDiscountChange,
    onMiscChange,
    className = "",
}: ChooseMenuProductTableProps) {
    const [isClient, setIsClient] = useState(false);

    const { parameterData } = useParameter();

    const [dialogStates, setDialogStates] = useState({
        selectProduct: false,
        branchStock: false,
        medicationDetails: false,
        customerDoctor: false,
        addCustomer: false,
        addDoctor: false,
        payment: false,
        transactionType: false,
        employeeLogin: false,
        paymentSuccess: false,
        fingerprint: false,
        calculator: false,
        shortcutGuide: false,
        upsell: false,
        prescriptionDiscount: false,
        chooseMisc: false,
        corporateDiscount: false,
        transactionHistory: false,
        globalDiscount: false,
        productHistory: false,
        monthlyPromo: false,
        transactionCorrection: false,
        addPendingBill: false,
        viewPendingBill: false,
    });

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [transactionTypeData, setTransactionTypeData] = useState<any>(null);

    const [selectedProductId, setSelectedProductId] = useState<number | null>(
        null
    );
    const [selectedProduct, setSelectedProduct] =
        useState<ProductTableItem | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    const [searchValue, setSearchValue] = useState("");
    const [preSearchQuery, setPreSearchQuery] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { logout } = useLogout();

    useEffect(() => {
        setIsClient(true);
        console.log("Component mounted");
    }, []);

    const toggleDialog = (dialogName: keyof typeof dialogStates) => {
        console.log(`Toggling dialog: ${dialogName}`, {
            currentState: dialogStates[dialogName],
            newState: !dialogStates[dialogName],
        });

        setDialogStates((prev) => ({
            ...prev,
            [dialogName]: !prev[dialogName],
        }));
    };

    const closeDialog = (dialogName: keyof typeof dialogStates) => {
        console.log(`Force closing dialog: ${dialogName}`);

        setDialogStates((prev) => ({
            ...prev,
            [dialogName]: false,
        }));
    };

    const handleShowCustomerDoctorDialog = () => {
        console.log(
            "Ctrl+Space: Opening Customer and Doctor Dialog for Payment Flow"
        );

        if (
            !products ||
            products.length === 0 ||
            !products.some((p) => p.name)
        ) {
            console.log("No products in cart, cannot proceed with payment");
            alert("Please add products to cart before proceeding with payment");
            return;
        }

        toggleDialog("customerDoctor");
    };

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

    const currentCartTotals = React.useMemo(() => {
        const filledProducts = products.filter((p) => p.name && p.quantity > 0);
        const subtotal = filledProducts.reduce(
            (sum, product) => sum + (product.subtotal || 0),
            0
        );
        return {
            products: filledProducts,
            totalAmount: subtotal,
        };
    }, [products]);

    usePOSKeyboardShortcuts(
        {
            showShortcutGuide: () => {
                console.log("Ctrl+Shift+F1: Opening Shortcut Guide");
                toggleDialog("shortcutGuide");
            },
            showProductHistory: () => {
                console.log("Ctrl+Shift+F2: Opening Product History Dialog");
                if (selectedRowId !== null && selectedProduct) {
                    toggleDialog("productHistory");
                } else {
                    console.log("No product selected for history");
                }
            },
            showPrescriptionDiscount: () => {
                console.log("Ctrl+Shift+F3: Opening Prescription Discount");
                if (selectedRowId !== null && selectedProduct) {
                    toggleDialog("prescriptionDiscount");
                } else {
                    console.log("No product selected for discount");
                }
            },
            showGlobalDiscount: () => {
                console.log("Shift+Alt+F3: Opening Global Discount");
                toggleDialog("globalDiscount");
            },
            clearAllProducts: () => {
                console.log("Ctrl+Shift+F4: Clear all products");
            },
            showPromoList: () => {
                console.log("Ctrl+Shift+F5: Opening Monthly Promo Highlights");
                toggleDialog("monthlyPromo");
            },
            showUpSelling: () => {
                console.log("Ctrl+Shift+F6: Opening Up Selling Dialog");
                if (selectedRowId !== null) {
                    toggleDialog("upsell");
                } else {
                    console.log("No product selected for upselling");
                }
            },
            showTransactionList: () => {
                console.log("Ctrl+Shift+F7: Opening Transaction History");
                toggleDialog("transactionHistory");
            },
            showTransactionCorrection: () => {
                console.log("Ctrl+Shift+F8: Opening Transaction Correction");
                toggleDialog("transactionCorrection");
            },
            addPendingBill: () => {
                console.log("Ctrl+Shift+F9: Add Pending Bill");
                toggleDialog("addPendingBill");
            },
            viewPendingBill: () => {
                console.log("Alt+Shift+F9: View Pending Bills");
                toggleDialog("viewPendingBill");
            },
            showMemberCorporate: () => {
                console.log("Ctrl+Shift+F10: Opening Corporate Discount");
                toggleDialog("corporateDiscount");
            },
            showNewItemSuggestion: () => {
                console.log("Ctrl+Shift+F11: Opening New Item Suggestion");
            },
            addMisc: () => {
                console.log("Ctrl+Shift+F12: Opening Add Misc Dialog");
                if (selectedRowId !== null && selectedProduct) {
                    toggleDialog("chooseMisc");
                } else {
                    console.log(
                        "No product selected for misc - no action taken"
                    );
                }
            },
        },
        {
            showCustomerDoctorDialog: handleShowCustomerDoctorDialog,
        },
        { enabled: isClient, debug: true }
    );

    useEffect(() => {
        if (tableContainerRef.current && products.length > 0 && isClient) {
            setTimeout(() => {
                if (tableContainerRef.current) {
                    tableContainerRef.current.scrollTop =
                        tableContainerRef.current.scrollHeight;
                }
            }, 100);
        }
    }, [products.length, isClient]);

    const handleProductSelectFromDialog = (selectedProduct: any) => {
        console.log("Product selected from dialog:", selectedProduct);

        if (onProductSelect && selectedProductId !== null) {
            onProductSelect(selectedProduct, selectedProductId);
        }

        closeDialog("selectProduct");
        setSelectedProductId(null);
        setSearchValue("");
        setPreSearchQuery("");
    };

    const handleRowClick = (product: ProductTableItem, index: number) => {
        const newSelectedRowId =
            selectedRowId === product.id ? null : product.id;
        setSelectedRowId(newSelectedRowId);

        if (newSelectedRowId !== null && product.name) {
            setSelectedProduct(product);
            console.log("Product selected:", product.name);
        } else {
            setSelectedProduct(null);
            console.log("Product deselected");
        }
    };

    const handleBranchStockClick = (product: ProductTableItem) => {
        if (product.name) {
            setSelectedProduct(product);
            toggleDialog("branchStock");
        }
    };

    const handleMedicationDetailsClick = (product: ProductTableItem) => {
        if (product.name) {
            setSelectedProduct(product);
            toggleDialog("medicationDetails");
        }
    };

    const handleTypeChange = (productId: number, newType: string) => {
        if (productId === 999) return;
        if (onTypeChange) {
            onTypeChange(productId, newType);
        }

        const newSCValue = getSCValueByType(newType);
        console.log(`Type changed to ${newType}, SC value: ${newSCValue}`);

        const updatedProducts = products.map((product) => {
            if (product.id === productId) {
                const updatedProduct = {
                    ...product,
                    type: newType,
                    sc: newSCValue,
                };

                updatedProduct.total =
                    (updatedProduct.subtotal || 0) +
                    (updatedProduct.sc || 0) +
                    (updatedProduct.misc || 0) -
                    (updatedProduct.subtotal || 0) *
                        ((updatedProduct.discount || 0) / 100) -
                    (updatedProduct.promo || 0);

                return updatedProduct;
            }
            return product;
        });

        console.log(
            "Updated product with new SC:",
            updatedProducts.find((p) => p.id === productId)
        );
    };

    const handleQuantityChangeWithFocus = (id: number, value: number) => {
        onQuantityChange(id, value);
    };

    const handleQuantityInputBlur = () => {
        if (onQuantityBlur) {
            onQuantityBlur();
        }
    };

    const handleQuantityInputKeyPress = (e: React.KeyboardEvent) => {
        if (onQuantityKeyPress) {
            onQuantityKeyPress(e);
        }
    };

    const convertToProductItems = (tableItems: ProductTableItem[]) => {
        return tableItems
            .filter((p) => p.name)
            .map((p) => ({
                id: p.id,
                name: p.name,
                quantity: p.quantity || 0,
                price: p.price || 0,
                subtotal: p.subtotal || 0,
                discount: p.discount || 0,
                sc: p.sc || 0,
                misc: p.misc || 0,
                promo: p.promo || 0,
                total: p.total || p.subtotal || 0,
                stockData: p.stockData,
                up: p.up || "N",
            }));
    };

    const handleSearchInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        setSearchValue(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (value.trim().length >= 3) {
            const timeoutId = setTimeout(() => {
                console.log(
                    "Auto-triggering product dialog with query after 2s delay:",
                    value.trim()
                );
                setPreSearchQuery(value.trim());
                setSelectedProductId(999);
                closeDialog("selectProduct");
                setTimeout(() => {
                    toggleDialog("selectProduct");
                }, 50);
            }, 500);

            setSearchTimeout(timeoutId);
        } else {
            setSearchTimeout(null);
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
                setSearchTimeout(null);
            }
            setSearchValue("");
            setPreSearchQuery("");
            console.log("Search cleared via ESC key");
        }
    };

    const handleOpenSelectProductDialog = () => {
        console.log("Opening Select Product Dialog (legacy)");
        setPreSearchQuery("");
        setSelectedProductId(999);
        closeDialog("selectProduct");
        setTimeout(() => {
            toggleDialog("selectProduct");
        }, 50);
    };

    const handleCustomerDoctorSubmit = (
        customerData: any,
        doctorData?: any
    ) => {
        console.log("Customer & Doctor submitted from Ctrl+Space:", {
            customerData,
            doctorData,
        });

        setSelectedCustomer(customerData);
        setSelectedDoctor(doctorData || null);

        closeDialog("customerDoctor");

        console.log("Opening Transaction Type Dialog from Ctrl+Space flow");
        toggleDialog("transactionType");
    };

    const handleCustomerSelect = (customer: any) => {
        setSelectedCustomer(customer);
    };

    const handleDoctorSelect = (doctor: any) => {
        setSelectedDoctor(doctor);
    };

    const handlePendingBillSubmit = (pendingBillData: any) => {
        console.log("Pending bill saved:", pendingBillData);
        alert("Pending bill saved successfully!");
    };

    const handleLoadPendingBill = (bill: any) => {
        console.log("Loading pending bill to cart:", bill);
        alert(`Loading pending bill: ${bill.customerName}`);
    };

    const handleDeletePendingBill = (billId: string) => {
        console.log("Deleting pending bill:", billId);
        alert(`Deleted pending bill: ${billId}`);
    };

    const tableData = React.useMemo(() => {
        const searchRow = {
            id: 999,
            name: "",
            type: "",
            price: 0,
            quantity: 0,
            subtotal: 0,
            discount: 0,
            sc: 0,
            misc: 0,
            promo: 0,
            promoPercent: 0,
            up: "N",
            noVoucher: 0,
            total: 0,
        };

        const filledProducts = products.filter((p) => p.name);
        return [searchRow, ...filledProducts];
    }, [products]);

    useEffect(() => {
        console.log("Dialog states:", dialogStates);
    }, [dialogStates]);

    useEffect(() => {
        if (isClient && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isClient]);

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    if (!isClient) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className={`bg-white rounded-2xl p-5 mb-6 ${className}`}>
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div
                        ref={tableContainerRef}
                        className="overflow-auto custom-scrollbar max-h-[610px]"
                    >
                        <table className="w-full min-w-[1350px]">
                            <thead className="sticky top-0 z-10 h-[60px]">
                                <tr className="bg-gray-100">
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[50px] rounded-tl-2xl"></th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[400px]">
                                        Product Name
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[70px]">
                                        Type
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[100px]">
                                        Price
                                    </th>
                                    <th className="text-center px-3 text-sm font-semibold text-black w-[60px]">
                                        Qty
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[100px]">
                                        SubTotal
                                    </th>
                                    <th className="text-center px-3 text-sm font-semibold text-black w-[70px]">
                                        Disc%
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[80px]">
                                        SC
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[80px]">
                                        Misc
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[80px]">
                                        Promo
                                    </th>
                                    <th className="text-center px-3 text-sm font-semibold text-black w-[70px]">
                                        Promo%
                                    </th>
                                    <th className="text-center px-3 text-sm font-semibold text-black w-[50px]">
                                        Up
                                    </th>
                                    <th className="text-center px-3 text-sm font-semibold text-black w-[80px]">
                                        NoVoucher
                                    </th>
                                    <th className="text-left px-3 text-sm font-semibold text-black w-[100px] rounded-tr-2xl">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody ref={tableBodyRef}>
                                {tableData.map((product, index) => {
                                    const hasProductData = !!product.name;
                                    const isSearchRow = product.id === 999;

                                    const displaySCValue = hasProductData
                                        ? getSCValueByType(product.type || "")
                                        : 0;

                                    return (
                                        <tr
                                            key={product.id}
                                            className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer ${
                                                selectedRowId === product.id
                                                    ? "bg-blue-50"
                                                    : ""
                                            } ${
                                                isSearchRow
                                                    ? "bg-blue-50 sticky top-14 z-5"
                                                    : index % 2 === 0
                                                    ? "bg-gray-50/30"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleRowClick(product, index)
                                            }
                                        >
                                            <td className="p-3">
                                                {hasProductData ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedRowId ===
                                                            product.id
                                                        }
                                                        onChange={() =>
                                                            handleRowClick(
                                                                product,
                                                                index
                                                            )
                                                        }
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4"></div>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    {hasProductData ? (
                                                        <>
                                                            <ProductActionIcons
                                                                productName={
                                                                    product.name
                                                                }
                                                                onBranchStockClick={() =>
                                                                    handleBranchStockClick(
                                                                        product
                                                                    )
                                                                }
                                                                onMedicationDetailsClick={() =>
                                                                    handleMedicationDetailsClick(
                                                                        product
                                                                    )
                                                                }
                                                                onDeleteClick={() =>
                                                                    onRemoveProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                            />
                                                            <span
                                                                className="cursor-pointer hover:text-blue-600 text-sm font-medium truncate max-w-[180px]"
                                                                onClick={() =>
                                                                    onProductNameClick?.(
                                                                        product.id
                                                                    )
                                                                }
                                                                title={
                                                                    product.name
                                                                }
                                                            >
                                                                {product.name}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-3 w-full">
                                                            <button
                                                                className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleOpenSelectProductDialog();
                                                                }}
                                                                title="Add Product"
                                                            >
                                                                <Plus className="w-5 h-5 text-blue-600" />
                                                            </button>
                                                            <Input
                                                                ref={
                                                                    searchInputRef
                                                                }
                                                                placeholder="Cari nama produk disini"
                                                                className="border-[#F0F0F0] text-sm h-11 flex-1 bg-white shadow-none"
                                                                value={
                                                                    searchValue
                                                                }
                                                                onChange={
                                                                    handleSearchInputChange
                                                                }
                                                                onKeyDown={
                                                                    handleSearchKeyDown
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <ProductTypeSelector
                                                    type={product.type || ""}
                                                    onChange={(newType) =>
                                                        handleTypeChange(
                                                            product.id,
                                                            newType
                                                        )
                                                    }
                                                    disabled={
                                                        isSearchRow ||
                                                        !hasProductData
                                                    }
                                                />
                                            </td>

                                            <td className="p-3 text-sm">
                                                <div className="whitespace-nowrap">
                                                    {formatCurrency(
                                                        product.price
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        value={
                                                            product.quantity ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleQuantityChangeWithFocus(
                                                                product.id,
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            )
                                                        }
                                                        onBlur={
                                                            handleQuantityInputBlur
                                                        }
                                                        onKeyDown={
                                                            handleQuantityInputKeyPress
                                                        }
                                                        className="w-[76px] text-sm border-[#F0F0F0] h-11 text-center"
                                                        min="0"
                                                        data-product-id={
                                                            product.id
                                                        }
                                                    />
                                                </div>
                                            </td>

                                            <td className="p-3 text-sm font-semibold">
                                                <div className="whitespace-nowrap">
                                                    {formatCurrency(
                                                        product.subtotal
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <div className="flex justify-center">
                                                    <span className="w-[76px] text-sm text-center py-2">
                                                        {product.discount || 0}%
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-3 text-sm">
                                                <div className="whitespace-nowrap">
                                                    {formatCurrency(
                                                        displaySCValue
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3 text-sm">
                                                <div className="whitespace-nowrap">
                                                    {formatCurrency(
                                                        product.misc
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3 text-sm">
                                                <div className="whitespace-nowrap">
                                                    {formatCurrency(
                                                        product.promo || 0
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3 text-sm text-center">
                                                {product.promoPercent || 0}%
                                            </td>

                                            <td className="p-3 text-sm text-center">
                                                {product.up || "N"}
                                            </td>

                                            <td className="p-3 text-sm text-center">
                                                {product.noVoucher || 0}
                                            </td>

                                            <td className="p-3 text-sm font-bold">
                                                <div className="whitespace-nowrap">
                                                    {formatCurrency(
                                                        hasProductData &&
                                                            product.subtotal
                                                            ? product.subtotal +
                                                                  displaySCValue +
                                                                  (product.misc ||
                                                                      0) -
                                                                  (product.subtotal *
                                                                      (product.discount ||
                                                                          0)) /
                                                                      100 -
                                                                  (product.promo ||
                                                                      0)
                                                            : 0
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <SelectProductDialog
                isOpen={dialogStates.selectProduct}
                onClose={() => {
                    console.log("SelectProduct onClose called");
                    closeDialog("selectProduct");
                    setSelectedProductId(null);
                    setSearchValue("");
                    setPreSearchQuery("");
                    if (searchTimeout) {
                        clearTimeout(searchTimeout);
                        setSearchTimeout(null);
                    }
                }}
                onSelectProduct={handleProductSelectFromDialog}
                initialSearchQuery={preSearchQuery}
                autoSearch={preSearchQuery.length >= 3}
            />

            <BranchWideStockDialog
                isOpen={dialogStates.branchStock}
                onClose={() => closeDialog("branchStock")}
                productName={selectedProduct?.name}
                productCode={selectedProduct?.stockData?.kode_brg}
                retailPrice={formatCurrency(selectedProduct?.price)}
                wholesalePrice={formatCurrency(selectedProduct?.price)}
                quantity={selectedProduct?.quantity || 0}
                expiredDate="29/05/2030"
                units={selectedProduct?.stockData?.isi || 1}
                strips={selectedProduct?.stockData?.strip || 1}
                qtyFree={1}
            />

            <MedicationDetailsDialog
                isOpen={dialogStates.medicationDetails}
                onClose={() => closeDialog("medicationDetails")}
                productName={selectedProduct?.name}
                productCode={selectedProduct?.stockData?.kode_brg}
            />

            <ProductHistoryDialog
                isOpen={dialogStates.productHistory}
                onClose={() => closeDialog("productHistory")}
                productName={selectedProduct?.name}
                productCode={selectedProduct?.stockData?.kode_brg}
            />

            <CustomerDoctorDialog
                isOpen={dialogStates.customerDoctor}
                onClose={() => closeDialog("customerDoctor")}
                onSelectCustomer={handleCustomerSelect}
                onSelectDoctor={handleDoctorSelect}
                onSubmit={handleCustomerDoctorSubmit}
                mode="both"
                initialFocus="customer"
                triggerPaymentFlow={true}
            />

            <PaymentDialog
                isOpen={dialogStates.payment}
                onClose={() => closeDialog("payment")}
                onPaymentSuccess={(changeData) => {
                    closeDialog("payment");
                    console.log("Payment successful from Ctrl+Space flow");
                    if (onRemoveProduct) {
                        products.forEach((p) => {
                            if (p.name) onRemoveProduct(p.id);
                        });
                    }

                    toggleDialog("paymentSuccess");
                }}
                totalAmount={
                    products.reduce((sum, p) => sum + (p.subtotal || 0), 0) ||
                    50000
                }
                orderDetails={{
                    customer: selectedCustomer?.name || "Unknown Customer",
                    items: products
                        .filter((p) => p.name)
                        .map((p) => ({
                            name: p.name,
                            quantity: p.quantity,
                            price: p.price,
                        })),
                }}
                customerData={selectedCustomer}
                doctorData={selectedDoctor}
                transactionTypeData={transactionTypeData}
                products={convertToProductItems(products)}
            />

            <AddCustomerDialog
                isOpen={dialogStates.addCustomer}
                onClose={() => closeDialog("addCustomer")}
                onSubmit={(customer) => {
                    console.log("New customer added:", customer);
                    closeDialog("addCustomer");
                }}
            />

            <AddDoctorDialog
                isOpen={dialogStates.addDoctor}
                onClose={() => closeDialog("addDoctor")}
                onSubmit={(doctor) => {
                    console.log("New doctor added:", doctor);
                    closeDialog("addDoctor");
                }}
            />

            <TransactionTypeDialog
                isOpen={dialogStates.transactionType}
                onClose={() => closeDialog("transactionType")}
                onSubmit={(transactionData) => {
                    console.log("Transaction type selected:", transactionData);
                    setTransactionTypeData(transactionData);
                    closeDialog("transactionType");
                    console.log("Opening Payment Dialog from Transaction Type");
                    toggleDialog("payment");
                }}
            />

            <EmployeeLoginDialog
                isOpen={dialogStates.employeeLogin}
                onClose={() => closeDialog("employeeLogin")}
                onLogin={(userData) => {
                    console.log("Employee logged in:", userData);
                    closeDialog("employeeLogin");
                }}
            />

            <PaymentSuccessDialog
                isOpen={dialogStates.paymentSuccess}
                onClose={() => closeDialog("paymentSuccess")}
            />

            <FingerprintScanningDialog
                isOpen={dialogStates.fingerprint}
                onClose={() => closeDialog("fingerprint")}
                onComplete={() => {
                    closeDialog("fingerprint");
                    console.log("Fingerprint scanning completed");
                }}
                scanningType="finger1-scan"
            />

            {dialogStates.calculator && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Calculator
                            </h2>
                            <button
                                onClick={() => closeDialog("calculator")}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <Calculator />
                    </div>
                </div>
            )}

            <KeyboardShortcutGuide
                isOpen={dialogStates.shortcutGuide}
                onClose={() => closeDialog("shortcutGuide")}
            />

            <UpsellDialog
                isOpen={dialogStates.upsell}
                onClose={() => closeDialog("upsell")}
                onConfirm={() => {
                    if (selectedRowId !== null) {
                        console.log(
                            `Product ${selectedRowId} marked as upselling product`
                        );
                    }
                    closeDialog("upsell");
                }}
                productName={selectedProduct?.name}
            />

            <PrescriptionDiscountDialog
                isOpen={dialogStates.prescriptionDiscount}
                onClose={() => closeDialog("prescriptionDiscount")}
                onSubmit={(productId, discount) => {
                    if (onDiscountChange) {
                        onDiscountChange(productId, discount);
                    }
                    closeDialog("prescriptionDiscount");
                }}
                selectedProduct={{
                    id: selectedProduct?.id || 0,
                    kode_brg: selectedProduct?.stockData?.kode_brg || "",
                    nama_brg: selectedProduct?.name || "",
                }}
            />

            <ChooseMiscDialog
                isOpen={dialogStates.chooseMisc}
                onClose={() => closeDialog("chooseMisc")}
                onSubmit={(miscData) => {
                    console.log("Misc applied:", miscData);

                    if (selectedRowId !== null && selectedProduct) {
                        if (onMiscChange) {
                            onMiscChange(selectedRowId, miscData.amount);
                        } else {
                            console.warn(
                                "onMiscChange callback not provided by parent component"
                            );
                        }

                        const updatedProduct = {
                            ...selectedProduct,
                            misc: (selectedProduct.misc || 0) + miscData.amount,
                        };

                        const displaySCValue = getSCValueByType(
                            selectedProduct.type || ""
                        );
                        updatedProduct.total =
                            (updatedProduct.subtotal || 0) +
                            displaySCValue +
                            (updatedProduct.misc || 0) -
                            (updatedProduct.subtotal || 0) *
                                ((updatedProduct.discount || 0) / 100) -
                            (updatedProduct.promo || 0);

                        setSelectedProduct(updatedProduct);

                        console.log("Misc applied to product:", {
                            productId: selectedRowId,
                            productName: selectedProduct?.name,
                            previousMisc: selectedProduct.misc || 0,
                            addedMisc: miscData.amount,
                            newMisc:
                                (selectedProduct.misc || 0) + miscData.amount,
                            medicationType: miscData.medicationType,
                            quantity: miscData.quantity,
                            newTotal: updatedProduct.total,
                        });
                    }

                    closeDialog("chooseMisc");
                }}
            />

            <CorporateDiscountDialog
                isOpen={dialogStates.corporateDiscount}
                onClose={() => closeDialog("corporateDiscount")}
                onSubmit={(selectedCorporates) => {
                    console.log(
                        "Corporate discount applied:",
                        selectedCorporates
                    );
                    closeDialog("corporateDiscount");
                }}
            />

            <TransactionHistoryDialog
                isOpen={dialogStates.transactionHistory}
                onClose={() => closeDialog("transactionHistory")}
            />

            <TransactionCorrectionDialog
                isOpen={dialogStates.transactionCorrection}
                onClose={() => closeDialog("transactionCorrection")}
                onSelectTransaction={(transaction) => {
                    console.log(
                        "Transaction selected for correction:",
                        transaction
                    );
                    closeDialog("transactionCorrection");
                }}
            />

            <GlobalDiscountDialog
                isOpen={dialogStates.globalDiscount}
                onClose={() => closeDialog("globalDiscount")}
                onSubmit={(globalDiscountData) => {
                    console.log("Global discount applied:", globalDiscountData);
                    closeDialog("globalDiscount");
                }}
            />

            <MonthlyPromoDialog
                isOpen={dialogStates.monthlyPromo}
                onClose={() => closeDialog("monthlyPromo")}
            />

            <AddPendingBillDialog
                isOpen={dialogStates.addPendingBill}
                onClose={() => closeDialog("addPendingBill")}
                onSubmit={handlePendingBillSubmit}
                currentProducts={currentCartTotals.products}
                currentTotal={currentCartTotals.totalAmount}
            />

            <ViewPendingBillDialog
                isOpen={dialogStates.viewPendingBill}
                onClose={() => closeDialog("viewPendingBill")}
                onLoadBill={handleLoadPendingBill}
                onDeleteBill={handleDeletePendingBill}
            />

            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #3b82f6 #f1f5f9;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3b82f6;
                    border-radius: 4px;
                    border: 1px solid #f1f5f9;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #2563eb;
                }

                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: #f1f5f9;
                }

                kbd {
                    background-color: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 3px;
                    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2),
                        inset 0 0 0 2px #ffffff;
                    color: #374151;
                    display: inline-block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                        Roboto, "Helvetica Neue", Arial, sans-serif;
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 1;
                    padding: 2px 4px;
                    white-space: nowrap;
                }
            `}</style>
        </>
    );
}
