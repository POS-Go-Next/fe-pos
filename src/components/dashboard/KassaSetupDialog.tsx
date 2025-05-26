"use client";

import { FC, useState } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface KassaSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const KassaSetupDialog: FC<KassaSetupDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // State untuk opsi yang dipilih
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif");
  const [antrian, setAntrian] = useState<"Aktif" | "Nonaktif">("Aktif");
  const [defaultPOS, setDefaultPOS] = useState<"Both" | "Resep" | "Swalayan">("Both");
  const [typePort, setTypePort] = useState<"USB" | "COM" | "LPT1" | "LPT2">("USB");
  const [macAddress, setMacAddress] = useState<string>("00:1A.2B.3C 4D:5E");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Dialog */}
      <div className="bg-white rounded-lg w-full max-w-4xl relative z-10">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-[#202325]">
            Kassa Setup (1)
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-6">
          {/* Status Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Status</h3>
              <div className="w-16 h-16">
                <Image 
                  src="/icons/status-icon.svg" 
                  alt="Status Icon"
                  width={64}
                  height={64}
                  // Gunakan gambar placeholder jika icon belum tersedia
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23E3EEFF'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
            <div className="flex w-full rounded-md overflow-hidden">
              <button 
                className={`flex-1 py-3 px-4 text-center ${status === 'Aktif' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setStatus("Aktif")}
              >
                Aktif
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${status === 'Nonaktif' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setStatus("Nonaktif")}
              >
                Nonaktif
              </button>
            </div>
          </div>

          {/* Antrian Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Antrian</h3>
              <div className="w-16 h-16">
                <Image 
                  src="/icons/printer-icon.svg" 
                  alt="Printer Icon"
                  width={64}
                  height={64}
                  // Gunakan gambar placeholder jika icon belum tersedia
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23E3EEFF'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
            <div className="flex w-full rounded-md overflow-hidden">
              <button 
                className={`flex-1 py-3 px-4 text-center ${antrian === 'Aktif' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setAntrian("Aktif")}
              >
                Aktif
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${antrian === 'Nonaktif' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setAntrian("Nonaktif")}
              >
                Nonaktif
              </button>
            </div>
          </div>

          {/* Default POS Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Default POS</h3>
              <div className="w-16 h-16">
                <Image 
                  src="/icons/pos-icon.svg" 
                  alt="POS Icon"
                  width={64}
                  height={64}
                  // Gunakan gambar placeholder jika icon belum tersedia
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23E3EEFF'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
            <div className="flex w-full rounded-md overflow-hidden">
              <button 
                className={`flex-1 py-3 px-4 text-center ${defaultPOS === 'Both' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setDefaultPOS("Both")}
              >
                Both
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${defaultPOS === 'Resep' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setDefaultPOS("Resep")}
              >
                Resep
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${defaultPOS === 'Swalayan' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setDefaultPOS("Swalayan")}
              >
                Swalayan
              </button>
            </div>
          </div>

          {/* Type Port Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Type Port</h3>
              <div className="w-16 h-16">
                <Image 
                  src="/icons/port-icon.svg" 
                  alt="Port Icon"
                  width={64}
                  height={64}
                  // Gunakan gambar placeholder jika icon belum tersedia
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23E3EEFF'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
            <div className="flex w-full rounded-md overflow-hidden">
              <button 
                className={`flex-1 py-3 px-4 text-center ${typePort === 'USB' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTypePort("USB")}
              >
                USB
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${typePort === 'COM' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTypePort("COM")}
              >
                COM
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${typePort === 'LPT1' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTypePort("LPT1")}
              >
                LPT1
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-center ${typePort === 'LPT2' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTypePort("LPT2")}
              >
                LPT2
              </button>
            </div>
          </div>

          {/* MAC Address Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">MAC Address</h3>
              <div className="w-16 h-16">
                <Image 
                  src="/icons/mac-icon.svg" 
                  alt="MAC Icon"
                  width={64}
                  height={64}
                  // Gunakan gambar placeholder jika icon belum tersedia
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23E3EEFF'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input 
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="flex-grow py-3"
              />
              <Button 
                className="bg-green-500 hover:bg-green-600"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Printer Aktif Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Printer Aktif</h3>
              <div className="w-16 h-16">
                <Image 
                  src="/icons/printer-icon.svg" 
                  alt="Printer Icon"
                  width={64}
                  height={64}
                  // Gunakan gambar placeholder jika icon belum tersedia
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='8' fill='%23E3EEFF'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
            <div className="relative">
              <button className="w-full flex justify-between items-center border bg-white rounded-md py-3 px-4">
                <span>Epson TMU Auto Cutter</span>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4">
          <Button 
            onClick={onSubmit} 
            className="w-full bg-blue-600 py-6"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KassaSetupDialog;