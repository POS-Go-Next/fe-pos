// components/shared/transaction-info.tsx - FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Calculator from "./calculator";
import { useRealTimeClock } from "@/lib/useRealTimeClock";

interface UserData {
  id: number;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  role_id: number;
  position_id: number;
}

interface TransactionInfoProps {
  transactionId: string;
  counter: string;
  date: string;
  badgeNumber?: number;
  className?: string;
  useRealTimeData?: boolean;
}

export default function TransactionInfo({
  transactionId,
  counter,
  date,
  badgeNumber,
  className = "",
  useRealTimeData = true,
}: TransactionInfoProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { time: currentTime, date: currentDate } = useRealTimeClock();

  // ✅ Safe client-side initialization
  useEffect(() => {
    setIsClient(true);

    // ✅ Safe localStorage access after client mount
    if (typeof window !== "undefined") {
      try {
        const storedUserData = localStorage.getItem("user-data");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const displayTransactionId = transactionId;
  const displayDate =
    useRealTimeData && isClient ? `${currentDate}, ${currentTime}` : date;
  const displayCounter =
    isClient && useRealTimeData && userData?.username && userData?.position_id
      ? `#${userData.username} / ${userData.position_id
          .toString()
          .padStart(2, "0")}`
      : counter;
  const displayBadge =
    isClient && useRealTimeData && userData?.id ? userData.id : badgeNumber;

  const getUserInitials = () => {
    if (!userData?.fullname) return "??";
    return userData.fullname
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">Transaction Information</h2>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-lg font-semibold">{displayTransactionId}</p>
          <p className="text-sm text-gray-600">{displayCounter}</p>
          <p className="text-sm text-gray-600">{displayDate}</p>
        </div>

        {(displayBadge || (isClient && userData)) && (
          <div className="bg-blue-100 text-blue-800 font-semibold rounded-md px-3 py-1 min-w-[3rem] text-center">
            {displayBadge || (isClient ? getUserInitials() : "??")}
          </div>
        )}
      </div>

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

      <div>
        <h3 className="text-lg font-semibold mb-2">Simple Calculator</h3>
        <Calculator />
      </div>
    </div>
  );
}
