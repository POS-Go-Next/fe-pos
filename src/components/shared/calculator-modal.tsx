"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (result: number) => void;
  initialValue?: string;
}

export default function CalculatorModal({
  isOpen,
  onClose,
  onCalculate,
  initialValue = "",
}: CalculatorModalProps) {
  const [expression, setExpression] = useState(initialValue);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setExpression(initialValue);
      setResult("");
      setError("");
      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialValue]);

  const evaluateExpression = (expr: string): number | null => {
    try {
      // Remove whitespace and validate characters
      const cleanExpr = expr.replace(/\s+/g, "");
      
      // Only allow numbers, operators, parentheses, and decimal points
      const validPattern = /^[0-9+\-*/().]+$/;
      if (!validPattern.test(cleanExpr)) {
        throw new Error("Invalid characters in expression");
      }

      // Prevent dangerous expressions
      if (cleanExpr.includes("**") || cleanExpr.length > 100) {
        throw new Error("Expression too complex");
      }

      // Use Function constructor for safe evaluation
      const result = new Function(`"use strict"; return (${cleanExpr})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error("Invalid result");
      }

      return Math.round(result * 100) / 100; // Round to 2 decimal places
    } catch {
      return null;
    }
  };

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    setError("");

    if (value.trim()) {
      const calculated = evaluateExpression(value);
      if (calculated !== null) {
        setResult(`= ${calculated}`);
      } else {
        setResult("");
      }
    } else {
      setResult("");
    }
  };

  const handleSubmit = () => {
    if (!expression.trim()) {
      onClose();
      return;
    }

    const calculated = evaluateExpression(expression);
    if (calculated !== null) {
      onCalculate(Math.floor(calculated)); // Convert to integer for quantity
      onClose();
    } else {
      setError("Invalid expression. Use numbers and operators (+, -, *, /, parentheses)");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Quantity Calculator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Math Expression
              </label>
              <Input
                ref={inputRef}
                type="text"
                value={expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 12 / 12 * 10"
                className="text-lg font-mono"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported operators: + - * / ( )
              </p>
            </div>

            {result && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-lg font-mono text-blue-800">{result}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!expression.trim()}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}