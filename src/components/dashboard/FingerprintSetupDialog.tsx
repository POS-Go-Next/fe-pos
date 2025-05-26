"use client";

import { FC, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface FingerprintSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

const FingerprintSetupDialog: FC<FingerprintSetupDialogProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Dialog */}
      <div className="bg-white rounded-lg w-full max-w-3xl relative z-10">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-[#202325]">
            Fingerprint Setup
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Username Selection */}
          <div className="mb-6">
            <label className="block text-gray-800 mb-2 font-medium">
              Username
            </label>
            <div className="relative">
              <button
                className="w-full flex justify-between items-center bg-[#F5F5F5] text-left rounded-md py-4 px-4"
              >
                <span>{selectedUser || "Select User"}</span>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Fingerprint Registration Area */}
          <div className="grid grid-cols-2 gap-6">
            {/* Register Fingerprint 1 */}
            <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
              <h3 className="text-lg font-medium mb-3 text-center">Register Fingerprint 1</h3>
              <p className="text-gray-600 text-center mb-6">
                Place your first finger on the sensor to capture its template.
              </p>
              
              <div className="w-32 h-32 mb-6 relative">
                <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                  <Image
                    src="/icons/fingerprint-icon.svg"
                    alt="Fingerprint"
                    width={80}
                    height={80}
                    // Fallback jika gambar tidak tersedia
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='38' fill='%23FECACA' stroke='%23EF4444' stroke-width='2'/%3E%3Cpath d='M40,15 C30,15 22,23 22,35 C22,45 27,55 40,65 C53,55 58,45 58,35 C58,23 50,15 40,15 Z' fill='none' stroke='%23EF4444' stroke-width='2'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => console.log("Scan Register 1")}
                className="w-full bg-blue-600"
              >
                Scan Register 1
              </Button>
            </div>
            
            {/* Register Finger 2 */}
            <div className="bg-white rounded-lg border p-6 flex flex-col items-center">
              <h3 className="text-lg font-medium mb-3 text-center">Register Finger 2</h3>
              <p className="text-gray-600 text-center mb-6">
                Use a different finger to add a backup fingerprint.
              </p>
              
              <div className="w-32 h-32 mb-6 relative">
                <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                  <Image
                    src="/icons/fingerprint-icon.svg"
                    alt="Fingerprint"
                    width={80}
                    height={80}
                    // Fallback jika gambar tidak tersedia
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='38' fill='%23FECACA' stroke='%23EF4444' stroke-width='2'/%3E%3Cpath d='M40,15 C30,15 22,23 22,35 C22,45 27,55 40,65 C53,55 58,45 58,35 C58,23 50,15 40,15 Z' fill='none' stroke='%23EF4444' stroke-width='2'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => console.log("Scan Register 2")}
                className="w-full bg-blue-600"
              >
                Scan Register 2
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FingerprintSetupDialog;