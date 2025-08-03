// components/ui/combobox.tsx - IMPROVED WITH TEXT TRUNCATION
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    displayValue?: string; // Custom display text
    truncateAt?: number; // Number of characters before truncation
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No options found.",
    disabled = false,
    loading = false,
    className,
    displayValue,
    truncateAt = 30,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
        "bottom"
    );
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get the selected option
    const selectedOption = options.find((option) => option.value === value);

    // Use displayValue if provided, otherwise use selectedOption label
    const displayText = displayValue || selectedOption?.label || "";

    // Truncate text if it's longer than truncateAt
    const getTruncatedText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const truncatedDisplayText = getTruncatedText(displayText, truncateAt);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle dropdown positioning
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const dropdownHeight = 200; // Estimated dropdown height
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setDropdownPosition("top");
            } else {
                setDropdownPosition("bottom");
            }
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled && !loading) {
            setIsOpen(!isOpen);
            setSearchTerm("");
        }
    };

    const handleSelect = (option: ComboboxOption) => {
        onValueChange?.(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={cn("relative", className)}>
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                disabled={disabled || loading}
                className={cn(
                    "flex w-full items-center justify-between rounded-md bg-[#F5F5F5] px-3 py-2 text-sm",
                    "border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-200",
                    className
                )}
                title={displayText} // Show full text on hover
            >
                <div className="flex items-center flex-1 min-w-0">
                    {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                    )}
                    <span
                        className={cn(
                            "block truncate text-left",
                            !selectedOption && "text-gray-500"
                        )}
                    >
                        {loading
                            ? "Loading..."
                            : truncatedDisplayText || placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={cn(
                        "ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && !loading && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 z-10 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        ref={dropdownRef}
                        className={cn(
                            "absolute z-20 w-full rounded-md border border-gray-200 bg-white shadow-lg",
                            dropdownPosition === "top"
                                ? "bottom-full mb-1"
                                : "top-full mt-1"
                        )}
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-100">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder={searchPlaceholder}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100",
                                            "focus:bg-gray-100 focus:outline-none",
                                            selectedOption?.value ===
                                                option.value &&
                                                "bg-blue-50 text-blue-600"
                                        )}
                                        title={option.label} // Show full text on hover
                                    >
                                        <span className="block truncate">
                                            {option.label}
                                        </span>
                                        {selectedOption?.value ===
                                            option.value && (
                                            <Check className="ml-2 h-4 w-4 flex-shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-6 text-center text-sm text-gray-500">
                                    {emptyText}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
