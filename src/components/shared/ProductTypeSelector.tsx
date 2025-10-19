"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

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

  const handleSelect = (selectedType: string) => {onChange(selectedType);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();onChange("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !document.querySelector(".product-type-dropdown")?.contains(target)
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

  useEffect(() => {}, [type]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center gap-1 bg-white border border-[#F0F0F0] text-gray-700 px-3 h-[44px] rounded-lg text-sm font-medium min-w-[72px] w-full justify-between transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
        } ${type ? "border-blue-300 bg-blue-50" : ""}`}
      >
        <span className={type ? "text-gray-900" : "text-gray-400"}>
          {type || ""}
        </span>

        <div className="flex items-center gap-1">
          {type && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
          <ChevronDown className="w-3 h-3" />
        </div>
      </button>

      {isOpen && buttonRect && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed bg-white border border-gray-300 rounded-md shadow-2xl z-[9999] min-w-[80px] overflow-hidden product-type-dropdown"
            style={{
              top: buttonRect.bottom + window.scrollY + 4,
              left: buttonRect.left + window.scrollX,
              width: buttonRect.width,
            }}
          >
            {type && (
              <>
                <button
                  onClick={() => handleSelect("")}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap text-gray-500 italic border-b border-gray-100"
                >
                  Clear selection
                </button>
              </>
            )}

            {types.map((t, _index) => (
              <button
                key={t}
                onClick={() => handleSelect(t)}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap ${
                  type === t ? "bg-blue-50 text-blue-600 font-medium" : ""
                }`}
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
