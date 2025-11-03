"use client";

import React, { useState } from "react";
import { X, Eye, EyeOff, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useFingerprintAuth } from "@/hooks/useFingerprintAuth";
import { showErrorAlert, showLoadingAlert } from "@/lib/swal";
import Swal from "sweetalert2";
import FingerprintScanningDialog from "./FingerprintScanningDialog";

interface UserData {
  id: string | number;
  username: string;
  fullname?: string;
  token?: string; // Auth token for return confirmation API calls
}

interface ReturnConfirmationLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: UserData) => void;
  transactionData?: {
    invoiceNumber: string;
    customerName: string;
  };
}

export default function ReturnConfirmationLoginDialog({
  isOpen,
  onClose,
  onConfirm,
  transactionData,
}: ReturnConfirmationLoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"credentials" | "fingerprint">("credentials");
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false);
  const [fingerprintComplete, setFingerprintComplete] = useState(false);

   const { loginForPopup, isLoading } = useAuth();
   const { fingerprintLogin, isLoading: isFingerprintLoading } = useFingerprintAuth();

  const handleConfirm = async () => {
    if (!username.trim() || !password.trim()) {
      await showErrorAlert("Missing Fields", "Please enter username and password");
      return;
    }

    try {
      showLoadingAlert("Verifying...", "Confirming user for return transaction");

       // Use the loginForPopup method to validate credentials
       // For return confirmation, we get user data only
       const result = await loginForPopup(
         { username: username.trim(), password: password.trim() },
         "return-confirmation"
       );

       if (result.success && result.data?.user) {
         const userData: UserData = {
           id: result.data.user.id,
           username: result.data.user.username,
           fullname: result.data.user.fullname,
           token: result.data.token, // Include the auth token for return transaction API calls
         };

         Swal.close();
         onConfirm(userData);
         resetForm();
      } else {
        Swal.close();
        await showErrorAlert("Authentication Failed", result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Confirmation login error:", error);
      Swal.close();
      await showErrorAlert(
        "Error",
        error instanceof Error ? error.message : "Failed to confirm user"
      );
    }
  };

   const handleFingerprintScan = async () => {
     setIsFingerprintScanning(true);
     setFingerprintComplete(false);

     try {
       showLoadingAlert("Scanning...", "Please place your fingerprint on the scanner");

       const result = await fingerprintLogin({
         device_id: "default",
         need_generate_token: false,
         type: "return_confirmation",
       });

       Swal.close();

        if (result.success && result.data?.user) {
          const userData: UserData = {
            id: result.data.user.id,
            username: result.data.user.username,
            fullname: result.data.user.fullname,
            token: result.data.token, // Include the auth token for return transaction API calls
          };

          setFingerprintComplete(true);
          setTimeout(() => {
            onConfirm(userData);
            resetForm();
            setFingerprintComplete(false);
          }, 1000);
       } else {
         await showErrorAlert("Authentication Failed", result.message || "Fingerprint not recognized");
         setIsFingerprintScanning(false);
       }
    } catch (error) {
      console.error("Fingerprint authentication error:", error);
      Swal.close();
      await showErrorAlert(
        "Error",
        error instanceof Error ? error.message : "Failed to authenticate with fingerprint"
      );
      setIsFingerprintScanning(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setLoginMode("credentials");
    setIsFingerprintScanning(false);
    setFingerprintComplete(false);
  };

  const handleClose = () => {
    if (isLoading || isFingerprintLoading || isFingerprintScanning) return;
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Confirm Return Transaction
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading || isFingerprintLoading || isFingerprintScanning}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {transactionData && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Invoice:</span>
                <span className="font-medium">{transactionData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{transactionData.customerName}</span>
              </div>
            </div>
          )}

          {/* Mode selector tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLoginMode("credentials")}
              disabled={isLoading || isFingerprintLoading || isFingerprintScanning}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                loginMode === "credentials"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              }`}
            >
              Credentials
            </button>
            <button
              onClick={() => setLoginMode("fingerprint")}
              disabled={isLoading || isFingerprintLoading || isFingerprintScanning}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                loginMode === "fingerprint"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              Fingerprint
            </button>
          </div>

          {/* Credentials mode */}
          {loginMode === "credentials" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-gray-50 border-gray-300 rounded-lg h-12"
                  disabled={isLoading}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleConfirm();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-gray-50 border-gray-300 rounded-lg h-12 pr-10"
                    disabled={isLoading}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleConfirm();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 pt-2">
                Please confirm your credentials to authorize this return transaction.
                This will be recorded as the confirming user for audit purposes.
              </p>
            </>
          )}

          {/* Fingerprint mode */}
          {loginMode === "fingerprint" && (
            <div className="text-center py-6">
              <Fingerprint className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Biometric Authentication
              </h3>
              <p className="text-gray-600 text-sm">
                Click the button below to authenticate using your fingerprint.
              </p>
              {fingerprintComplete && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  ✓ Authentication successful
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isFingerprintLoading || isFingerprintScanning}
            className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={loginMode === "credentials" ? handleConfirm : handleFingerprintScan}
            disabled={isLoading || isFingerprintLoading || isFingerprintScanning}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isFingerprintScanning
              ? "Scanning..."
              : isLoading
              ? "Confirming..."
              : loginMode === "fingerprint"
              ? "Scan Fingerprint"
              : "Confirm"}
          </Button>
        </div>
      </div>

      {/* Fingerprint scanning dialog */}
      <FingerprintScanningDialog
        isOpen={isFingerprintScanning}
        onClose={() => setIsFingerprintScanning(false)}
        onComplete={() => {
          setFingerprintComplete(true);
        }}
        scanningType="finger1-scan"
        isApiProcessing={isFingerprintLoading}
      />
    </div>
  );
}
