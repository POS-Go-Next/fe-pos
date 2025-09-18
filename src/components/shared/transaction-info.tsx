"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Calculator from "./calculator";
import { useRealTimeClock } from "@/lib/useRealTimeClock";
import { useTransactionInfo } from "@/hooks/useTransactionInfo";

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
    className?: string;
    useRealTimeData?: boolean;
}

export default function TransactionInfo({
    className = "",
    useRealTimeData = true,
}: TransactionInfoProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isClient, setIsClient] = useState(false);
    const { time: currentTime, date: currentDate } = useRealTimeClock();

    const {
        invoiceNumber,
        counterInfo,
        queueNumber,
        isLoading: isApiLoading,
        error: apiError,
    } = useTransactionInfo();

    useEffect(() => {
        setIsClient(true);

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

    const displayTime = useRealTimeData && isClient ? currentTime : "07:00:00";
    const displayDate =
        useRealTimeData && isClient ? currentDate : "August 17, 2025";
    const displayDateTime = `${displayDate}, ${displayTime}`;

    const displayInvoiceNumber = invoiceNumber || "S25080315";
    const displayCounterInfo = counterInfo || "#guest/0";
    const displayBadge =
        queueNumber || (isClient && userData?.id ? userData.id : "??");

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
            <h2 className="text-lg font-semibold mb-4">
                Transaction Information
            </h2>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-lg font-semibold">
                        {isApiLoading ? "Loading..." : displayInvoiceNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                        {isApiLoading ? "Loading..." : displayCounterInfo}
                    </p>
                    <p className="text-sm text-gray-600">{displayDateTime}</p>
                    {apiError && (
                        <p className="text-xs text-red-500 mt-1">
                            API Error: Using fallback data
                        </p>
                    )}
                </div>

                <div className="bg-blue-100 text-blue-800 font-semibold rounded-md px-3 py-1 min-w-[3rem] text-center">
                    {isApiLoading ? "..." : displayBadge}
                </div>
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
                <h3 className="text-lg font-semibold mb-2">
                    Simple Calculator
                </h3>
                <Calculator />
            </div>
        </div>
    );
}
