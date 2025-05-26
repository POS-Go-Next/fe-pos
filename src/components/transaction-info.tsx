"use client";

import { Button } from "@/components/ui/button";

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
      <h2 className="text-lg font-semibold mb-2">Transaction Information</h2>
      <div className="flex justify-between items-center">
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
      <Button
        variant="outline"
        className="w-full mt-4 text-left justify-start border-blue-200 text-blue-500"
      >
        Notes
      </Button>
    </div>
  );
}
