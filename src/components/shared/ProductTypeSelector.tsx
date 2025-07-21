// components/shared/ProductTypeSelector.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface ProductTypeSelectorProps {
  type: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}

const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
  type,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const types = ["R/", "RC"];

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (selectedType: string) => {
    onChange(selectedType);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center gap-1 bg-white border border-[#F0F0F0] text-gray-700 px-3 h-[44px] rounded-lg text-sm font-medium min-w-[72px] w-full justify-between transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
        }`}
      >
        {type || "R/"}
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Portal dropdown to body to avoid overflow issues */}
      {isOpen && buttonRect && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown positioned absolutely relative to viewport */}
          <div
            className="fixed bg-white border border-gray-300 rounded-md shadow-2xl z-[9999] min-w-[80px] overflow-hidden"
            style={{
              top: buttonRect.bottom + window.scrollY + 4,
              left: buttonRect.left + window.scrollX,
              width: buttonRect.width,
            }}
          >
            {types.map((t, index) => (
              <button
                key={t}
                onClick={() => handleSelect(t)}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap ${
                  index === 0 ? "rounded-t-md" : ""
                } ${index === types.length - 1 ? "rounded-b-md" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default ProductTypeSelector;
