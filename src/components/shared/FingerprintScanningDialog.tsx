// components/shared/FingerprintScanningDialog.tsx
"use client";

import { FC, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FingerprintScanningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  scanningType: 'scan' | 'rescan' | '';
}

const FingerprintScanningDialog: FC<FingerprintScanningDialogProps> = ({
  isOpen,
  onClose,
  onComplete,
  scanningType,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScanCompleted(false);
      
      // Simulate scanning process (3 seconds)
      // TODO: Replace with actual fingerprint scanning API
      const timer = setTimeout(() => {
        setIsScanning(false);
        setScanCompleted(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleComplete = () => {
    onComplete();
    setIsScanning(false);
    setScanCompleted(false);
  };

  const handleClose = () => {
    onClose();
    setIsScanning(false);
    setScanCompleted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

      {/* Dialog */}
      <div className="bg-white rounded-lg w-full max-w-md relative z-10">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-[#202325]">
            Scanning Fingerprint
          </h2>
          <button onClick={handleClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-8 text-center">
          {/* Fingerprint Icon */}
          <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <div className={`text-8xl transition-all duration-500 ${
              scanCompleted 
                ? 'text-green-500 scale-110' 
                : isScanning 
                ? 'text-blue-500 animate-pulse' 
                : 'text-gray-300'
            }`}>
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

          <div className="mb-8">
            <p className="text-gray-600 mb-2">
              {scanCompleted 
                ? 'Scan completed successfully!' 
                : isScanning 
                ? 'Scanning in progress...' 
                : 'Scan your finger to Get Started'
              }
            </p>
            <p className="text-[#202325] font-medium">Touch Sensor</p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {scanCompleted ? (
              <Button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="px-8"
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