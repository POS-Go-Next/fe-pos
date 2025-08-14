// hooks/useKeyboardShortcuts.ts - FIXED DIALOG MAPPING
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

    // ✅ Safe client-side initialization
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!enabled || !isClient) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if focus is on input/textarea elements (allow shortcuts on focused inputs)
            const activeElement = document.activeElement;
            const isInputFocused =
                activeElement &&
                (activeElement.tagName === "INPUT" ||
                    activeElement.tagName === "TEXTAREA" ||
                    (activeElement as HTMLElement).contentEditable === "true");

            for (const shortcut of shortcuts) {
                // Enhanced key matching for F1-F12 keys
                const keyMatches =
                    event.key === shortcut.key ||
                    event.code === shortcut.key ||
                    // Special handling for F4 and other F-keys
                    (shortcut.key === "F4" &&
                        (event.key === "F4" ||
                            event.code === "F4" ||
                            event.keyCode === 115 ||
                            event.keyCode === 131)) || // Some browsers use different codes
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

                    if (debug) {
                        console.log(`🎹 Keyboard shortcut triggered:`, {
                            key: shortcut.key,
                            ctrl: shortcut.ctrl,
                            shift: shortcut.shift,
                            alt: shortcut.alt,
                            description: shortcut.description,
                            isInputFocused,
                            eventKey: event.key,
                            eventCode: event.code,
                            keyCode: event.keyCode,
                        });
                    }

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

// ✅ FIXED: Safe F1-F12 shortcuts creator with CORRECT mapping
export const createSafeDialogShortcuts = (actions: {
    showShortcutGuide?: () => void; // Ctrl+Shift+F1 -> F1 (Petunjuk Shortcut)
    showPaymentDialog?: () => void; // ✅ FIXED: Ctrl+Shift+F2 -> F2 (Payment Dialog)
    showPrescriptionDiscount?: () => void; // Ctrl+Shift+F3 -> F3 (Discount Resep)
    showGlobalDiscount?: () => void; // Shift+Alt+F3 -> F3 (Global Discount)
    clearAllProducts?: () => void; // Ctrl+Shift+F4 -> F4 (Batal/Void)
    showPromoList?: () => void; // Ctrl+Shift+F5 -> F5 (Daftar Promo)
    showUpSelling?: () => void; // Ctrl+Shift+F6 -> F6 (Up Selling)
    showTransactionList?: () => void; // ✅ FIXED: Ctrl+Shift+F7 -> F7 (Daftar Transaksi)
    showTransactionCorrection?: () => void; // Ctrl+Shift+F8 -> F8 (Koreksi Transaksi)
    addPendingBill?: () => void; // Ctrl+Shift+F9 -> F9 (Tambah Bon Gantung)
    showMemberCorporate?: () => void; // Ctrl+Shift+F10 -> F10 (Member Corporate)
    showNewItemSuggestion?: () => void; // Ctrl+Shift+F11 -> F11 (Usulan barang baru)
    addMisc?: () => void; // Ctrl+Shift+F12 -> F12 (Tambah Misc)
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

    // ✅ FIXED: F2 should open Payment Dialog, not Transaction Type
    if (actions.showPaymentDialog) {
        shortcuts.push({
            key: "F2",
            ctrl: true,
            shift: true,
            action: actions.showPaymentDialog,
            description: "Bayar/Payment Dialog",
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

    // NEW: Global Discount with Shift+Alt+F3
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
            description: "Daftar Promo Bulan Ini",
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

    // ✅ FIXED: Use showTransactionList instead of transactionHistory
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

// ✅ ENHANCED: Existing POS shortcuts (keep existing functionality)
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

    return shortcuts;
};

// ✅ ENHANCED: Combined hook for both safe dialog shortcuts and existing POS shortcuts
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
