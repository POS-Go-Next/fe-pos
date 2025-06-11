// components/dashboard/KassaSetupDialog.tsx - FIXED VERSION
"use client";

import { FC, useState } from "react";
import { X, Router, Wifi, Fingerprint, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal";
import { useKassa } from "@/hooks/useKassa";

interface KassaSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface KassaSetupData {
  antrian: boolean;
  status_aktif: boolean;
  finger: 'Y' | 'N';
  default_jual: '0' | '1' | '2'; // 0=Swalayan, 1=Resep, 2=Both
  ip_address: string;
  mac_address: string;
}

// Hardcoded values as requested
const HARDCODED_IP = "192.168.1.20";
const HARDCODED_MAC = "84-1B-77-FD-31-35";

const KassaSetupDialog: FC<KassaSetupDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Form state
  const [formData, setFormData] = useState<KassaSetupData>({
    antrian: true, // Queue Active by default
    status_aktif: true, // Status Active by default
    finger: 'Y', // Fingerprint Active by default
    default_jual: '2', // Both by default
    ip_address: HARDCODED_IP,
    mac_address: HARDCODED_MAC,
  });

  const [selectedPrinter, setSelectedPrinter] = useState<string>(
    "Epson TMU 220B-776 Auto Cutter USB Dot Matrix"
  );
  
  // Use custom hook for kassa management
  const { updateKassa, isLoading: isSubmitting } = useKassa();

  if (!isOpen) return null;

  // Handle toggle changes
  const handleToggle = (field: keyof KassaSetupData, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Call API using custom hook
      const success = await updateKassa(HARDCODED_MAC, formData);
      
      if (success) {
        // Show success message
        await showSuccessAlert(
          'Success!',
          'Kassa setup saved successfully',
          1500
        );

        // Call parent callbacks
        onSubmit();
        onClose();
      }
      // Note: Error handling is now done in the useKassa hook
      // including session expired handling with auto-popup
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      
      // Show generic error message for unexpected errors
      await showErrorAlert(
        'Unexpected Error',
        'An unexpected error occurred. Please try again.',
        'OK'
      );
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to default values
    setFormData({
      antrian: true,
      status_aktif: true,
      finger: 'Y',
      default_jual: '2',
      ip_address: HARDCODED_IP,
      mac_address: HARDCODED_MAC,
    });
    setSelectedPrinter("Epson TMU 220B-776 Auto Cutter USB Dot Matrix");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleCancel}></div>

      {/* Dialog */}
      <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#202325]">
            Kassa Setup (1)
          </h2>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Row 1: Default POS & Status */}
          <div className="grid grid-cols-2 gap-6">
            {/* Default POS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Default POS</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Router className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle('default_jual', '2')}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.default_jual === '2'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('default_jual', '1')}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.default_jual === '1'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Resep
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('default_jual', '0')}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.default_jual === '0'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Swalayan
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Status</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle('status_aktif', true)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.status_aktif
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('status_aktif', false)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !formData.status_aktif
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Queue & Fingerprint */}
          <div className="grid grid-cols-2 gap-6">
            {/* Queue (Antrian) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Queue (Antrian)</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle('antrian', true)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.antrian
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('antrian', false)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !formData.antrian
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            {/* Fingerprint */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Fingerprint</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle('finger', 'Y')}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.finger === 'Y'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle('finger', 'N')}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.finger === 'N'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: IP Address & MAC Address */}
          <div className="grid grid-cols-2 gap-6">
            {/* IP Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">IP Address</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={formData.ip_address}
                  onChange={(e) => handleToggle('ip_address', e.target.value)}
                  className="flex-1 bg-gray-50"
                  placeholder="192.168.1.20"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                  disabled={isSubmitting}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* MAC Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">MAC Address</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={formData.mac_address}
                  onChange={(e) => handleToggle('mac_address', e.target.value)}
                  className="flex-1 bg-gray-50"
                  placeholder="84-1B-77-FD-31-35"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                  disabled={isSubmitting}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Row 4: Active Printer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">Active Printer</h3>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter} disabled={isSubmitting}>
              <SelectTrigger className="w-full bg-gray-50">
                <SelectValue placeholder="Select printer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Epson TMU 220B-776 Auto Cutter USB Dot Matrix">
                  Epson TMU 220B-776 Auto Cutter USB Dot Matrix
                </SelectItem>
                <SelectItem value="Epson TMU Auto Cutter">
                  Epson TMU Auto Cutter
                </SelectItem>
                <SelectItem value="HP LaserJet">
                  HP LaserJet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KassaSetupDialog;