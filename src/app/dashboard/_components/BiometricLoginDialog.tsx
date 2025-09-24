import { Button } from "@/components/ui/button";
import { useFingerprintAuth } from "@/hooks/useFingerprintAuth";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Check, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface BiometricLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSuccess: (userData: any) => void;
  scanDuration?: number;
  loginType?: string;
}

type BiometricState =
  | "idle"
  | "scanning"
  | "success"
  | "error"
  | "loading_system_info";

interface SystemInfoData {
  hostname: string;
  ipAddresses: Array<{
    name: string;
    ipAddress: string;
    macAddress: string;
    isUp: boolean;
    isLoopback: boolean;
  }>;
  deviceConfig?: {
    deviceId: string;
    deviceName: string;
    grpcServerHost: string;
  };
  osInfo: {
    platform: string;
    architecture: string;
    numCPU: number;
  };
  workingDir: string;
  timestamp: string;
}

const BiometricLoginDialog: React.FC<BiometricLoginDialogProps> = ({
  isOpen,
  onClose,
  onBack,
  onSuccess,
  scanDuration = 3000,
  loginType,
}) => {
  const [biometricState, setBiometricState] = useState<BiometricState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [hasTriedScan, setHasTriedScan] = useState(false);
  const { fingerprintLogin, isLoading } = useFingerprintAuth();
  const { logout } = useAuth();

  const fetchSystemInfo = async () => {
    try {
      setBiometricState("loading_system_info");

      const response = await fetch("http://localhost:8321/api/system/info");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch system information");
      }

      const systemData: SystemInfoData = data.data;

      if (!systemData.deviceConfig?.deviceId) {
        throw new Error("No valid device ID found");
      }

      setDeviceId(systemData.deviceConfig.deviceId);
      setBiometricState("idle");

      console.log("System info fetched:", {
        hostname: systemData.hostname,
        deviceId: systemData.deviceConfig.deviceId,
        deviceName: systemData.deviceConfig.deviceName,
      });
    } catch (error) {
      console.error("Failed to fetch system info:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to get system information"
      );
      setBiometricState("error");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setBiometricState("idle");
      setProgress(0);
      setErrorMessage("");
      setDeviceId("");
      setHasTriedScan(false);
      fetchSystemInfo();
    }
  }, [isOpen]);

  const handleStartScan = async () => {
    if (!deviceId) {
      setErrorMessage("MAC address not available");
      setBiometricState("error");
      return;
    }

    setBiometricState("scanning");
    setProgress(0);
    setErrorMessage("");
    setHasTriedScan(true);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (scanDuration / 100);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    try {
      const result = await fingerprintLogin({
        device_id: deviceId,
        need_generate_token: true,
        type: loginType === "sales" ? "sales" : undefined,
      });

      clearInterval(progressInterval);

      if (result.success && result.data?.user) {
        setBiometricState("success");
        setProgress(100);

        setTimeout(() => {
          onSuccess(result.data!.user);
        }, 1500);
      } else {
        setBiometricState("error");
        setErrorMessage(result.message || "Fingerprint verification failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      setBiometricState("error");
      setErrorMessage("Failed to verify fingerprint. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen && biometricState === "idle" && deviceId && !hasTriedScan) {
      const timer = setTimeout(() => {
        handleStartScan();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, biometricState, deviceId, hasTriedScan]);

  const handleLogoutAndClose = async () => {
    try {
      await logout();
      console.log("✅ User logged out successfully");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
    setBiometricState("idle");
    setProgress(0);
    setErrorMessage("");
    setDeviceId("");
    setHasTriedScan(false);
    onClose();
  };

  const handleBack = async () => {
    try {
      await logout();
      console.log("✅ User logged out successfully on back");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
    setBiometricState("idle");
    setProgress(0);
    setErrorMessage("");
    setDeviceId("");
    setHasTriedScan(false);
    onBack();
  };

  const handleRetry = () => {
    setBiometricState("idle");
    setProgress(0);
    setErrorMessage("");
    setHasTriedScan(false);
    setTimeout(() => {
      handleStartScan();
    }, 500);
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (biometricState) {
      case "loading_system_info":
        return (
          <>
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm mb-4">
                Preparing biometric authentication
              </p>
              <p className="text-gray-900 font-medium">
                Loading system information...
              </p>
            </div>
          </>
        );

      case "idle":
        return (
          <>
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm mb-4">
                Log in using your biometric credential
              </p>
              <p className="text-gray-900 font-medium">Touch Sensor</p>
              {deviceId && (
                <p className="text-gray-400 text-xs mt-2">Device: {deviceId}</p>
              )}
            </div>
          </>
        );

      case "scanning":
        return (
          <>
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200">
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
                  style={{
                    animationDuration: "2s",
                    animationTimingFunction: "linear",
                  }}
                />
              </div>

              <svg
                className="w-24 h-24 text-blue-500 animate-pulse z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm mb-4">
                Log in using your biometric credential
              </p>
              <p className="text-gray-900 font-medium">Scanning...</p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        );

      case "success":
        return (
          <>
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-white stroke-[3]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm mb-4">
                Log in using your biometric credential
              </p>
              <p className="text-gray-900 font-medium">Successfully Verified</p>
            </div>
          </>
        );

      case "error":
        return (
          <>
            <div className="w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-12 h-12 text-white stroke-[3]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-600 text-sm mb-4">
                Log in using your biometric credential
              </p>
              <p className="text-red-600 font-medium">
                {errorMessage || "Verification Failed"}
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 relative">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Biometric Login
          </h2>
          <button
            onClick={handleLogoutAndClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="p-8">
          {renderContent()}

          <div className="flex justify-center">
            {biometricState === "error" ? (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="px-8 py-3 border-red-500 text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                Try Again
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleBack}
                className="px-8 py-3 border-blue-500 text-blue-500 hover:bg-blue-50 transition-all duration-200"
                disabled={
                  biometricState === "scanning" ||
                  biometricState === "loading_system_info" ||
                  isLoading
                }
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricLoginDialog;
