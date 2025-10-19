"use client";

import { useEffect, useState } from "react";

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    action: () => void;
    description?: string;
    preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
    debug?: boolean;
}

export const useKeyboardShortcuts = ({
    shortcuts,
    enabled = true,
    debug = false,
}: UseKeyboardShortcutsOptions) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!enabled || !isClient) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const _isInputFocused =
                activeElement &&
                (activeElement.tagName === "INPUT" ||
                    activeElement.tagName === "TEXTAREA" ||
                    (activeElement as HTMLElement).contentEditable === "true");

            for (const shortcut of shortcuts) {
                const keyMatches =
                    event.key === shortcut.key ||
                    event.code === shortcut.key ||
                    (shortcut.key === "F4" &&
                        (event.key === "F4" ||
                            event.code === "F4" ||
                            event.keyCode === 115 ||
                            event.keyCode === 131)) ||
                    (shortcut.key.startsWith("F") &&
                        event.code === shortcut.key &&
                        event.key === shortcut.key);

                const ctrlMatches = shortcut.ctrl
                    ? event.ctrlKey || event.metaKey
                    : !(event.ctrlKey || event.metaKey);

                const altMatches = shortcut.alt ? event.altKey : !event.altKey;

                const shiftMatches = shortcut.shift
                    ? event.shiftKey
                    : !event.shiftKey;

                if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                    }

                    if (debug) {}

                    shortcut.action();
                    break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [shortcuts, enabled, debug, isClient]);

    return {
        shortcuts: shortcuts.map((shortcut) => ({
            key: shortcut.key,
            ctrl: shortcut.ctrl,
            alt: shortcut.alt,
            shift: shortcut.shift,
            meta: shortcut.meta,
            description: shortcut.description,
            combination: [
                shortcut.ctrl &&
                    (isClient &&
                    typeof navigator !== "undefined" &&
                    navigator.platform.indexOf("Mac") > -1
                        ? "Cmd"
                        : "Ctrl"),
                shortcut.alt && "Alt",
                shortcut.shift && "Shift",
                shortcut.key === "F4" &&
                    isClient &&
                    typeof navigator !== "undefined" &&
                    navigator.platform.indexOf("Mac") > -1 &&
                    shortcut.ctrl &&
                    "fn",
                shortcut.key,
            ]
                .filter(Boolean)
                .join("+"),
        })),
        isClient,
    };
};

export const createSafeDialogShortcuts = (actions: {
    showShortcutGuide?: () => void;
    showProductHistory?: () => void;
    showPrescriptionDiscount?: () => void;
    showGlobalDiscount?: () => void;
    clearAllProducts?: () => void;
    showPromoList?: () => void;
    showUpSelling?: () => void;
    showTransactionList?: () => void;
    showTransactionCorrection?: () => void;
    addPendingBill?: () => void;
    showMemberCorporate?: () => void;
    showNewItemSuggestion?: () => void;
    addMisc?: () => void;
    viewPendingBill?: () => void;
}): KeyboardShortcut[] => {
    const shortcuts: KeyboardShortcut[] = [];

    if (actions.showShortcutGuide) {
        shortcuts.push({
            key: "F1",
            ctrl: true,
            shift: true,
            action: actions.showShortcutGuide,
            description: "Petunjuk Penggunaan Shortcut",
        });
    }

    if (actions.showProductHistory) {
        shortcuts.push({
            key: "F2",
            ctrl: true,
            shift: true,
            action: actions.showProductHistory,
            description: "Product History Dialog",
        });
    }

    if (actions.showPrescriptionDiscount) {
        shortcuts.push({
            key: "F3",
            ctrl: true,
            shift: true,
            action: actions.showPrescriptionDiscount,
            description: "Discount (hanya untuk resep)",
        });
    }

    if (actions.showGlobalDiscount) {
        shortcuts.push({
            key: "F3",
            shift: true,
            alt: true,
            action: actions.showGlobalDiscount,
            description: "Discount Global",
        });
    }

    if (actions.clearAllProducts) {
        shortcuts.push({
            key: "F4",
            ctrl: true,
            shift: true,
            action: actions.clearAllProducts,
            description: "Batal/Void (Clear Form Transaksi)",
        });
    }

    if (actions.showPromoList) {
        shortcuts.push({
            key: "F5",
            ctrl: true,
            shift: true,
            action: actions.showPromoList,
            description: "Monthly Promo Highlights",
        });
    }

    if (actions.showUpSelling) {
        shortcuts.push({
            key: "F6",
            ctrl: true,
            shift: true,
            action: actions.showUpSelling,
            description: "Up Selling",
        });
    }

    if (actions.showTransactionList) {
        shortcuts.push({
            key: "F7",
            ctrl: true,
            shift: true,
            action: actions.showTransactionList,
            description: "Daftar Transaksi",
        });
    }

    if (actions.showTransactionCorrection) {
        shortcuts.push({
            key: "F8",
            ctrl: true,
            shift: true,
            action: actions.showTransactionCorrection,
            description: "Koreksi Transaksi/Retur",
        });
    }

    if (actions.addPendingBill) {
        shortcuts.push({
            key: "F9",
            ctrl: true,
            shift: true,
            action: actions.addPendingBill,
            description: "Tambah Bon Gantung",
        });
    }

    if (actions.viewPendingBill) {
        shortcuts.push({
            key: "F9",
            alt: true,
            shift: true,
            action: actions.viewPendingBill,
            description: "Lihat Bon Gantung",
        });
    }

    if (actions.showMemberCorporate) {
        shortcuts.push({
            key: "F10",
            ctrl: true,
            shift: true,
            action: actions.showMemberCorporate,
            description: "Member Corporate",
        });
    }

    if (actions.showNewItemSuggestion) {
        shortcuts.push({
            key: "F11",
            ctrl: true,
            shift: true,
            action: actions.showNewItemSuggestion,
            description: "Usulan barang baru",
        });
    }

    if (actions.addMisc) {
        shortcuts.push({
            key: "F12",
            ctrl: true,
            shift: true,
            action: actions.addMisc,
            description: "Tambah Misc",
        });
    }

    return shortcuts;
};

export const createPOSShortcuts = (actions: {
    clearAllProducts?: () => void;
    showShortcutGuide?: () => void;
    showUpselling?: () => void;
    paymentDialog?: () => void;
    discountDialog?: () => void;
    voidTransaction?: () => void;
    pendingBill?: () => void;
    memberCorporate?: () => void;
    transactionHistory?: () => void;
    showCustomerDoctorDialog?: () => void;
}): KeyboardShortcut[] => {
    const shortcuts: KeyboardShortcut[] = [];

    if (actions.showShortcutGuide) {
        shortcuts.push({
            key: "F1",
            ctrl: true,
            action: actions.showShortcutGuide,
            description: "Petunjuk Penggunaan Shortcut",
        });
    }

    if (actions.clearAllProducts) {
        shortcuts.push({
            key: "F4",
            ctrl: true,
            action: actions.clearAllProducts,
            description: "Batal/Void (Clear Form Transaksi)",
        });
    }

    if (actions.showUpselling) {
        shortcuts.push({
            key: "F6",
            ctrl: true,
            action: actions.showUpselling,
            description: "Up Selling",
        });
    }

    if (actions.transactionHistory) {
        shortcuts.push({
            key: "F7",
            ctrl: true,
            action: actions.transactionHistory,
            description: "Transaction History",
            preventDefault: true,
        });
    }

    if (actions.paymentDialog) {
        shortcuts.push({
            key: "F2",
            action: actions.paymentDialog,
            description: "Bayar/Payment Dialog",
        });
    }

    if (actions.discountDialog) {
        shortcuts.push({
            key: "F3",
            action: actions.discountDialog,
            description: "Discount (hanya untuk resep)",
        });
    }

    if (actions.pendingBill) {
        shortcuts.push({
            key: "F9",
            action: actions.pendingBill,
            description: "Tambah Bon Gantung",
        });
    }

    if (actions.memberCorporate) {
        shortcuts.push({
            key: "F10",
            action: actions.memberCorporate,
            description: "Member Corporate",
        });
    }

    if (actions.showCustomerDoctorDialog) {
        shortcuts.push({
            key: " ",
            ctrl: true,
            action: actions.showCustomerDoctorDialog,
            description: "Enter Customer and Doctor Data",
            preventDefault: true,
        });
    }

    return shortcuts;
};

export const usePOSKeyboardShortcuts = (
    dialogActions: Parameters<typeof createSafeDialogShortcuts>[0],
    posActions: Parameters<typeof createPOSShortcuts>[0],
    options: { enabled?: boolean; debug?: boolean } = {}
) => {
    const dialogShortcuts = createSafeDialogShortcuts(dialogActions);
    const posShortcuts = createPOSShortcuts(posActions);
    const allShortcuts = [...dialogShortcuts, ...posShortcuts];

    return useKeyboardShortcuts({
        shortcuts: allShortcuts,
        enabled: options.enabled,
        debug: options.debug,
    });
};
