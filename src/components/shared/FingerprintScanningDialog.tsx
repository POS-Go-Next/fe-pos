// components/shared/FingerprintScanningDialog.tsx - FIXED TIMING ISSUE WITH API
"use client";

import { FC, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FingerprintScanningDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    scanningType:
        | "finger1-scan"
        | "finger1-rescan"
        | "finger2-scan"
        | "finger2-rescan"
        | "";
    isApiProcessing?: boolean;
}

const FingerprintScanningDialog: FC<FingerprintScanningDialogProps> = ({
    isOpen,
    onClose,
    onComplete,
    scanningType,
    isApiProcessing = false,
}) => {
    const [scanCompleted, setScanCompleted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setScanCompleted(false);
            setProgress(0);

            if (isApiProcessing) {
                const progressInterval = setInterval(() => {
                    setProgress((prev) => {
                        const newProgress = prev + 2;
                        return newProgress >= 95 ? 95 : newProgress;
                    });
                }, 100);

                return () => {
                    clearInterval(progressInterval);
                };
            }
        }
    }, [isOpen, isApiProcessing]);

    useEffect(() => {
        if (!isApiProcessing && progress > 0) {
            setProgress(100);
            setScanCompleted(true);
        }
    }, [isApiProcessing, progress]);

    const handleComplete = () => {
        onComplete();
        setScanCompleted(false);
        setProgress(0);
    };

    const handleClose = () => {
        onClose();
        setScanCompleted(false);
        setProgress(0);
    };

    const getDisplayText = () => {
        switch (scanningType) {
            case "finger1-scan":
                return {
                    title: "Scanning Fingerprint 1",
                    subtitle: "Registering fingerprint 1",
                    instruction: "Place your first finger on the scanner",
                };
            case "finger1-rescan":
                return {
                    title: "Validating Fingerprint 1",
                    subtitle: "Verifying fingerprint 1 match",
                    instruction: "Place your first finger on the scanner again",
                };
            case "finger2-scan":
                return {
                    title: "Scanning Fingerprint 2",
                    subtitle: "Registering fingerprint 2",
                    instruction: "Place your second finger on the scanner",
                };
            case "finger2-rescan":
                return {
                    title: "Validating Fingerprint 2",
                    subtitle: "Verifying fingerprint 2 match",
                    instruction:
                        "Place your second finger on the scanner again",
                };
            default:
                return {
                    title: "Scanning Fingerprint",
                    subtitle: "Processing fingerprint scan",
                    instruction: "Place your finger on the scanner",
                };
        }
    };

    if (!isOpen) return null;

    const displayText = getDisplayText();

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            ></div>

            <div className="bg-white rounded-lg w-full max-w-md relative z-10">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-[#202325]">
                        {displayText.title}
                    </h2>
                    <button onClick={handleClose}>
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-8 text-center">
                    <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center relative">
                        {isApiProcessing && (
                            <div className="absolute inset-0 rounded-full border-4 border-blue-200">
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            </div>
                        )}

                        <div
                            className={`text-8xl transition-all duration-500 z-10 ${
                                scanCompleted
                                    ? "text-green-500 scale-110"
                                    : isApiProcessing
                                    ? "text-blue-500 animate-pulse"
                                    : "text-gray-300"
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-20 w-20"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {displayText.subtitle}
                        </h3>
                        <p className="text-gray-600 mb-3">
                            {scanCompleted
                                ? "Scan completed successfully!"
                                : isApiProcessing
                                ? "Scanning in progress..."
                                : displayText.instruction}
                        </p>
                        <p className="text-[#202325] font-medium">
                            Touch Sensor
                        </p>
                    </div>

                    {(isApiProcessing || progress > 0) && (
                        <div className="mb-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-100 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {Math.round(progress)}% Complete
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center">
                        {scanCompleted ? (
                            <Button
                                onClick={handleComplete}
                                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base font-medium"
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="px-8 py-3 text-base font-medium"
                            >
                                ← Back
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FingerprintScanningDialog;
