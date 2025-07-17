"use client";

import { Button } from "@/components/ui/button";
import Calculator from "./calculator";

interface TransactionInfoProps {
  transactionId: string;
  counter: string;
  date: string;
  badgeNumber?: number;
  className?: string;
}

export default function TransactionInfo({
  transactionId,
  counter,
  date,
  badgeNumber,
  className = "",
}: TransactionInfoProps) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">Transaction Information</h2>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-lg font-semibold">{transactionId}</p>
          <p className="text-sm text-gray-600">{counter}</p>
          <p className="text-sm text-gray-600">{date}</p>
        </div>
        {badgeNumber && (
          <div className="bg-blue-100 text-blue-800 font-semibold rounded-md px-3 py-1">
            {badgeNumber}
          </div>
        )}
      </div>

      {/* Add Notes Button */}
      <Button
        variant="outline"
        className="w-full mb-6 text-left justify-start border-blue-200 text-blue-500"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Add Notes
      </Button>

      {/* Simple Calculator */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Simple Calculator</h3>
        <Calculator />
      </div>
    </div>
  );
}
