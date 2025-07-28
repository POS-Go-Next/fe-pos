// hooks/useKeyboardShortcuts.ts - FIXED VERSION
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
      for (const shortcut of shortcuts) {
        const keyMatches =
          event.key === shortcut.key ||
          event.code === shortcut.key ||
          (shortcut.key === "F4" &&
            (event.key === "F4" ||
              event.code === "F4" ||
              event.keyCode === 115 ||
              event.keyCode === 131));

        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !(event.ctrlKey || event.metaKey);
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
            event.stopPropagation();
          }

          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
          "fn",
        shortcut.key,
      ]
        .filter(Boolean)
        .join("+"),
    })),
  };
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

  if (actions.paymentDialog) {
    shortcuts.push({
      key: "F2",
      action: actions.paymentDialog,
      description: "Bayar/Hystorical Transaksi",
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

export const usePOSKeyboardShortcuts = (
  actions: Parameters<typeof createPOSShortcuts>[0],
  options: { enabled?: boolean; debug?: boolean } = {}
) => {
  const shortcuts = createPOSShortcuts(actions);
  return useKeyboardShortcuts({
    shortcuts,
    enabled: options.enabled,
    debug: options.debug,
  });
};
