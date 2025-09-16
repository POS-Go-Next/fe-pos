"use client";

import { FC } from "react";
import Calculator from "@/components/shared/calculator";

interface CalculatorToggleProps {
    isVisible: boolean;
    onToggle: () => void;
}

const CalculatorToggle: FC<CalculatorToggleProps> = ({
    isVisible,
    onToggle,
}) => {
    return (
        <>
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
                {isVisible ? "Hide Calculator" : "Show Calculator"}
            </button>

            <div
                className={`absolute top-0 right-0 w-[280px] h-full transition-all duration-500 ease-in-out ${
                    isVisible
                        ? "transform translate-x-0 opacity-100"
                        : "transform translate-x-full opacity-0 pointer-events-none"
                }`}
            >
                <div className="p-4 bg-[#fff] rounded-xl h-full">
                    <h2 className="text-lg font-semibold mb-2">
                        Simple Calculator
                    </h2>
                    <Calculator />
                </div>
            </div>
        </>
    );
};

export default CalculatorToggle;
