"use client";

import EmployeeLoginDialog from "@/components/shared/EmployeeLoginDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKassa } from "@/hooks/useKassa";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { useKassaData } from "@/hooks/useKassaData";
import { usePrinter } from "@/hooks/usePrinter";
import { useAuth } from "@/hooks/useAuth";
import { UserData } from "@/types/user";
import { showErrorAlert, showSuccessAlert } from "@/lib/swal";
import { X, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { FC, useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

interface KassaSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface KassaSetupData {
  default_jual: "1" | "2";
  status_aktif: boolean;
  antrian: boolean;
  finger: "Y" | "N";
  device_id: string;
  printer_id: number | null;
}

const KassaSetupDialog: FC<KassaSetupDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [hasValidToken, setHasValidToken] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const { logout } = useAuth();

  const {
    deviceId,
    isLoading: isSystemLoading,
    error: systemError,
    refetch: refetchSystemInfo,
  } = useSystemInfo();

  const {
    kassaData,
    isLoading: isKassaLoading,
    error: _kassaError,
    refetch: _refetchKassaData,
    isSessionExpired: kassaSessionExpired,
  } = useKassaData({
    deviceId,
    enabled: hasValidToken && !!deviceId,
  });

  const {
    printers,
    isLoading: isPrinterLoading,
    error: printerError,
    refetch: _refetchPrinters,
    isSessionExpired: printerSessionExpired,
  } = usePrinter({
    offset: 0,
    limit: 50,
    enabled: hasValidToken,
  });

  const { updateKassa, isLoading: isSubmitting } = useKassa();

  const [formData, setFormData] = useState<KassaSetupData>({
    default_jual: "1",
    status_aktif: true,
    antrian: true,
    finger: "Y",
    device_id: "",
    printer_id: null,
  });

  const [selectedPrinterId, setSelectedPrinterId] = useState<number | null>(
    null
  );

  const checkTokenStatus = useCallback(async () => {
    setIsCheckingToken(true);

    try {
      const response = await fetch(`/api/kassa/${deviceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        setHasValidToken(true);
        setIsCheckingToken(false);
      } else if (response.status === 401) {
        setHasValidToken(false);
        setIsCheckingToken(false);
        showSessionExpiredPopup();
      } else {
        setHasValidToken(false);
        setIsCheckingToken(false);
        showSessionExpiredPopup();
      }
    } catch (_error) {
      setHasValidToken(false);
      setIsCheckingToken(false);
      showSessionExpiredPopup();
    }
  }, [deviceId]);

  useEffect(() => {
    if (isOpen) {
      checkTokenStatus();
    }
  }, [isOpen, checkTokenStatus]);

  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsDataLoaded(false);
      setHasLoadedFromStorage(false);
    }
  }, [isOpen]);

  // Load data from API when available
  useEffect(() => {
    if (kassaData && deviceId && hasValidToken && !isDataLoaded) {setFormData({
        default_jual: kassaData.default_jual as "1" | "2",
        status_aktif: kassaData.status_aktif,
        antrian: kassaData.antrian,
        finger: kassaData.finger as "Y" | "N",
        device_id: kassaData.device_id || deviceId,
        printer_id: kassaData.printer_id || null,
      });

      if (kassaData.printer?.id) {
        setSelectedPrinterId(kassaData.printer.id);
      }

      setIsDataLoaded(true);
      setHasLoadedFromStorage(true);
    }
  }, [kassaData, deviceId, hasValidToken, isDataLoaded]);

  // Load from localStorage only if no API data and hasn't loaded from storage yet
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      deviceId &&
      hasValidToken &&
      !kassaData &&
      !isKassaLoading &&
      !hasLoadedFromStorage &&
      !isDataLoaded
    ) {
      const savedData = localStorage.getItem(`kassa-setup-${deviceId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData.formData);
          setSelectedPrinterId(parsedData.selectedPrinterId);} catch (_error) {
          console.error("Error parsing saved data:", _error);
        }
      } else {
        // Set default values with deviceId
        setFormData((prev) => ({
          ...prev,
          device_id: deviceId,
        }));}
      setHasLoadedFromStorage(true);
      setIsDataLoaded(true);
    }
  }, [
    deviceId,
    hasValidToken,
    kassaData,
    isKassaLoading,
    hasLoadedFromStorage,
    isDataLoaded,
  ]);

  // Save to localStorage when form data changes
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      deviceId &&
      hasValidToken &&
      isDataLoaded
    ) {
      const dataToSave = {
        formData,
        selectedPrinterId,
      };
      localStorage.setItem(
        `kassa-setup-${deviceId}`,
        JSON.stringify(dataToSave)
      );}
  }, [formData, selectedPrinterId, deviceId, hasValidToken, isDataLoaded]);

  useEffect(() => {
    if (printerSessionExpired) {
      setHasValidToken(false);
      showSessionExpiredPopup();
    }
  }, [printerSessionExpired]);

  useEffect(() => {
    if (kassaSessionExpired) {
      setHasValidToken(false);
      showSessionExpiredPopup();
    }
  }, [kassaSessionExpired]);



  const showSessionExpiredPopup = () => {let timerInterval: NodeJS.Timeout;

    Swal.fire({
      icon: "warning",
      title: "Session Expired",
      html: `
        <div class="text-sm text-gray-600 mb-4">
          Your session has expired. Please login again.
        </div>
        <div class="text-xs text-gray-500">
          This popup will close automatically in <strong id="timer">3</strong> seconds
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: "Login Now",
      confirmButtonColor: "#025CCA",
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: "rounded-xl shadow-2xl",
        confirmButton: "rounded-lg px-6 py-2 font-medium",
        title: "text-lg font-bold text-red-600",
        htmlContainer: "text-sm",
      },
      background: "#ffffff",
      color: "#1f2937",
      didOpen: () => {
        const timer = Swal.getPopup()?.querySelector("#timer");
        let remainingTime = 3;

        timerInterval = setInterval(() => {
          remainingTime--;
          if (timer) {
            timer.textContent = remainingTime.toString();
          }

          if (remainingTime <= 0) {
            clearInterval(timerInterval);
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {setIsLoginDialogOpen(true);
      }
    });
  };

  const handleLoginSuccess = (_userData: UserData) => {setHasValidToken(true);
    setIsLoginDialogOpen(false);
    setIsDataLoaded(false);
    setHasLoadedFromStorage(false);
  };

  const handleLoginClose = () => {setIsLoginDialogOpen(false);
    onClose();
  };

  const handleLogoutAndClose = async () => {
    try {
      await logout();} catch (_error) {
      console.error("❌ Logout error:", _error);
    }
    onClose();
  };

  if (!isOpen) return null;

  if (isCheckingToken || isSystemLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="bg-white rounded-lg p-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>
              {isCheckingToken
                ? "Checking authentication..."
                : "Loading system information..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasValidToken) {
    return (
      <EmployeeLoginDialog
        isOpen={isLoginDialogOpen}
        onClose={handleLoginClose}
        onLogin={handleLoginSuccess}
        loginType="kassa"
      />
    );
  }

  if (systemError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={handleLogoutAndClose}
        ></div>
        <div className="bg-white rounded-lg p-8 relative z-10 max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              System Error
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">{systemError}</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={refetchSystemInfo}
              className="flex-1"
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={handleLogoutAndClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = (
    field: keyof KassaSetupData,
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {if (!hasValidToken) {
        showSessionExpiredPopup();
        return;
      }

      if (!deviceId) {
        await showErrorAlert(
          "Error",
          "Device ID not available. Please check your system configuration.",
          "OK"
        );
        return;
      }

      const submitData: KassaSetupData = {
        default_jual: formData.default_jual,
        status_aktif: formData.status_aktif,
        antrian: formData.antrian,
        finger: formData.finger,
        device_id: formData.device_id,
        printer_id: selectedPrinterId,
      };const result = await updateKassa(deviceId, submitData);

      if (result.isSessionExpired) {
        setHasValidToken(false);
        showSessionExpiredPopup();
        return;
      }

      if (!result.success) {
        console.error("❌ Kassa setup failed:", result);
        await showErrorAlert(
          "Setup Failed",
          result.error || "Failed to save kassa setup. Please try again.",
          "OK"
        );
        return;
      }

      // Refetch fresh data from API to update cacheawait refetchKassaData();

      await showSuccessAlert(
        "Success!",
        "Kassa setup saved successfully",
        1500
      );onSubmit();
      handleLogoutAndClose();
    } catch (_error) {
      console.error("❌ Error in kassa setup:", _error);
      await showErrorAlert(
        "Unexpected Error",
        "An unexpected error occurred. Please try again.",
        "OK"
      );
    }
  };

  const handleCancel = async () => {
    if (typeof window !== "undefined" && deviceId) {
      localStorage.removeItem(`kassa-setup-${deviceId}`);}

    setFormData({
      default_jual: "1",
      status_aktif: true,
      antrian: true,
      finger: "Y",
      device_id: deviceId || "",
      printer_id: null,
    });
    setSelectedPrinterId(null);
    setIsDataLoaded(false);
    setHasLoadedFromStorage(false);
    handleLogoutAndClose();
  };

  const isLoading =
    isKassaLoading || isSubmitting || !hasLoadedFromStorage || isPrinterLoading;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      ></div>

      <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-2xl relative z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">Kassa Setup (1)</h2>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-4 bg-white rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">
                  Default POS
                </h3>
                <Image
                  src={"icons/icon-1.svg"}
                  alt="icon"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle("default_jual", "2")}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.default_jual === "2"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Resep
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("default_jual", "1")}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.default_jual === "1"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Swalayan
                </button>
              </div>
            </div>

            <div className="space-y-4 bg-white rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Status</h3>
                <Image
                  src={"icons/icon-2.svg"}
                  alt="icon"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle("status_aktif", true)}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.status_aktif
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("status_aktif", false)}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !formData.status_aktif
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-4 bg-white rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">
                  Queue (Antrian)
                </h3>
                <Image
                  src={"icons/icon-3.svg"}
                  alt="icon"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle("antrian", true)}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.antrian
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("antrian", false)}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    !formData.antrian
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="space-y-4 bg-white rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">
                  Fingerprint
                </h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Image
                    src={"icons/icon-4.svg"}
                    alt="icon"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleToggle("finger", "Y")}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.finger === "Y"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle("finger", "N")}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    formData.finger === "N"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">Device ID</h3>
              <Image
                src={"icons/icon-6.svg"}
                alt="icon"
                width={40}
                height={40}
              />
            </div>
            <div className="flex gap-2">
              <Input
                value={formData.device_id}
                onChange={(e) => handleToggle("device_id", e.target.value)}
                className="flex-1 bg-gray-50"
                placeholder="KASSA-1234-5678-9ABC"
                disabled={isLoading}
              />
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-6"
                disabled={isLoading}
                onClick={refetchSystemInfo}
              >
                {isSystemLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4 bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">
                Active Printer
              </h3>
              <Image
                src={"icons/icon-7.svg"}
                alt="icon"
                width={40}
                height={40}
              />
            </div>
            <Select
              value={selectedPrinterId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedPrinterId(value ? parseInt(value) : null)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-gray-50">
                <SelectValue
                  placeholder={
                    isPrinterLoading
                      ? "Loading printers..."
                      : printerError
                      ? "Error loading printers"
                      : "Select printer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id.toString()}>
                    {printer.nm_printer}
                    {printer.status && (
                      <span className="ml-2 text-xs text-green-600">
                        (Active)
                      </span>
                    )}
                  </SelectItem>
                ))}
                {printers.length === 0 && !isPrinterLoading && (
                  <SelectItem value="" disabled>
                    No printers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 py-3 h-[44px] max-w-[86px] border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 py-3 h-[44px] max-w-[86px] bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KassaSetupDialog;
