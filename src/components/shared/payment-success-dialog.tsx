"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface PaymentSuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    changeCash?: number;
    changeCC?: number;
    changeDC?: number;
}

export default function PaymentSuccessDialog({
    isOpen,
    onClose,
    changeCash = 0,
    changeCC = 0,
    changeDC = 0,
}: PaymentSuccessDialogProps) {
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowDialog(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Calculate total change
    const totalChange = changeCash + changeCC + changeDC;

    // Determine change message
    const getChangeMessage = () => {
        if (totalChange > 0) {
            return `Payment successful! Your change: Rp ${totalChange.toLocaleString(
                "id-ID"
            )}`;
        }
        return "Payment completed successfully!";
    };

    const handleDone = async () => {
        try {
            // Hit API next-invoice untuk update nomor invoice
            console.log(
                "🔄 Updating invoice number after payment completion..."
            );
            window.dispatchEvent(new CustomEvent("refetch-transaction-info"));

            // Tunggu sebentar untuk memastikan API call selesai
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Error updating invoice number:", error);
        } finally {
            setShowDialog(false);
            onClose();
        }
    };

    if (!showDialog) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg px-8 py-12 text-center max-w-sm w-full">
                <div className="flex justify-center mb-8">
                    {/* Modern Success Icon */}
                    <div className="relative w-[150px] h-[150px]">
                        {/* Background circle with gradient */}
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-xl">
                            <div className="w-[130px] h-[130px] rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-inner">
                                {/* Modern checkmark with shield design */}
                                <svg
                                    className="w-20 h-20 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{
                                        animation: "slideInCheck 1.2s ease-out",
                                    }}
                                >
                                    {/* Shield background */}
                                    <path
                                        d="M12 2C12 2 4 4 4 12C4 18 12 22 12 22C12 22 20 18 20 12C20 4 12 2 12 2Z"
                                        fill="currentColor"
                                        fillOpacity="0.2"
                                    />
                                    {/* Modern checkmark */}
                                    <path
                                        d="M9 12L11 14L15 10"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        style={{
                                            strokeDasharray: "20",
                                            strokeDashoffset: "20",
                                            animation:
                                                "drawCheck 0.8s ease-out 0.3s forwards",
                                        }}
                                    />
                                    {/* Decorative elements */}
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="2"
                                        fill="currentColor"
                                        fillOpacity="0.1"
                                        style={{
                                            animation:
                                                "pulseCenter 2s ease-in-out infinite 1s",
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Modern ripple effects */}
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-300/50 animate-ping opacity-40"></div>
                        <div
                            className="absolute inset-3 rounded-full border border-teal-300/40 animate-ping opacity-60"
                            style={{ animationDelay: "0.7s" }}
                        ></div>

                        {/* Floating particles */}
                        <div
                            className="absolute top-4 right-8 w-2 h-2 bg-emerald-300 rounded-full animate-bounce opacity-70"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                            className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce opacity-60"
                            style={{ animationDelay: "1s" }}
                        ></div>
                        <div
                            className="absolute top-8 left-10 w-1 h-1 bg-cyan-300 rounded-full animate-bounce opacity-50"
                            style={{ animationDelay: "1.5s" }}
                        ></div>
                    </div>
                </div>
                <h2 className="text-2xl text-[#202325] mb-4 font-semibold">
                    Transaction Complete
                </h2>
                <p className="text-sm text-[#636566] mb-6 font-normal">
                    {getChangeMessage()}
                </p>
                <div className="flex justify-center">
                    <Button className="px-12 py-3" onClick={handleDone}>
                        Done
                    </Button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInCheck {
                    0% {
                        transform: scale(0.5) rotate(-45deg);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1) rotate(5deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }

                @keyframes drawCheck {
                    0% {
                        stroke-dashoffset: 20;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes pulseCenter {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.1;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.3;
                    }
                }

                @keyframes checkmark {
                    0%,
                    100% {
                        transform: scale(1) rotate(0deg);
                    }
                    25% {
                        transform: scale(1.1) rotate(5deg);
                    }
                    50% {
                        transform: scale(1.2) rotate(0deg);
                    }
                    75% {
                        transform: scale(1.1) rotate(-5deg);
                    }
                }
            `}</style>
        </div>
    );
}
