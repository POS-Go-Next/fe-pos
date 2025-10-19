"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const useDropdownPosition = () => {
    const [position, setPosition] = useState<{
        top: number;
        left: number;
        width: number;
        maxHeight: number;
        placement: "top" | "bottom";
    }>({ top: 0, left: 0, width: 0, maxHeight: 240, placement: "bottom" });

    const calculatePosition = useCallback((triggerElement: HTMLElement) => {
        const rect = triggerElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom - 20;
        const spaceAbove = rect.top - 20;
        const placement =
            spaceBelow < 200 && spaceAbove > spaceBelow ? "top" : "bottom";
        const maxHeight =
            placement === "top"
                ? Math.min(spaceAbove, 240)
                : Math.min(spaceBelow, 240);

        setPosition({
            top: placement === "top" ? rect.top - maxHeight : rect.bottom,
            left: rect.left,
            width: rect.width,
            maxHeight,
            placement,
        });
    }, []);

    return { position, calculatePosition };
};

interface DropdownPortalProps {
    children: React.ReactNode;
    isOpen: boolean;
    triggerRef: React.RefObject<HTMLDivElement>;
    onClose: () => void;
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({
    children,
    isOpen,
    triggerRef,
    onClose,
}) => {
    const { position, calculatePosition } = useDropdownPosition();

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            calculatePosition(triggerRef.current);
        }
    }, [isOpen, calculatePosition, triggerRef]);

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen && triggerRef.current) {
                calculatePosition(triggerRef.current);
            }
        };

        const handleResize = () => {
            if (isOpen && triggerRef.current) {
                calculatePosition(triggerRef.current);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                const dropdown = document.querySelector(
                    '[data-dropdown-content="true"]'
                );
                if (dropdown && dropdown.contains(event.target as Node)) {
                    return;
                }
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("scroll", handleScroll, true);
            window.addEventListener("resize", handleResize);
            document.addEventListener("click", handleClickOutside, true);
        }

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, [isOpen, onClose, calculatePosition, triggerRef]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed bg-white border border-gray-300 rounded-md shadow-2xl z-[9999] overflow-hidden"
            data-dropdown-content="true"
            style={{
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
            }}
        >
            {children}
        </div>,
        document.body
    );
};
