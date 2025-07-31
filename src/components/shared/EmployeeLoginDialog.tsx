// components/shared/EmployeeLoginDialog.tsx - UPDATED WITH BIOMETRIC
"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { showErrorAlert } from "@/lib/swal";
import BiometricLoginDialog from "@/app/dashboard/_components/BiometricLoginDialog"; // Import biometric dialog

interface UserData {
  id: number;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  role_id: number;
  position_id: number;
  fingerprint1: string;
  fingerprint2: string;
}

interface EmployeeLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: UserData) => void;
}

export default function EmployeeLoginDialog({
  isOpen,
  onClose,
  onLogin,
}: EmployeeLoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false); // State untuk biometric dialog

  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      await showErrorAlert(
        "Validation Error",
        "Please enter both username and password",
        "OK"
      );
      return;
    }

    try {
      const result = await login({ username, password });

      if (result.success && result.data) {
        const userData: UserData = {
          id: result.data.user.id,
          fullname: result.data.user.fullname || "Unknown User",
          username: result.data.user.username,
          email: result.data.user.email,
          phone: result.data.user.phone || "",
          role_id: result.data.user.role_id || 1,
          position_id: result.data.user.position_id || 1,
          fingerprint1: "",
          fingerprint2: "",
        };

        onLogin(userData);
        setUsername("");
        setPassword("");
      } else {
        await showErrorAlert(
          "Login Failed",
          result.message || "Invalid username or password",
          "OK"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      await showErrorAlert(
        "Login Error",
        "An unexpected error occurred. Please try again.",
        "OK"
      );
    }
  };

  // Handle biometric login button click
  const handleBiometricClick = () => {
    setIsBiometricOpen(true);
  };

  // Handle biometric login success
  const handleBiometricSuccess = (userData: any) => {
    setIsBiometricOpen(false);
    
    // Transform API user data to local UserData format
    const transformedUserData: UserData = {
      id: userData.id,
      fullname: userData.fullname,
      username: userData.username,
      email: userData.email,
      phone: userData.phone || "",
      role_id: userData.role_id || 1,
      position_id: userData.position_id || 1,
      fingerprint1: "registered",
      fingerprint2: "registered",
    };

    onLogin(transformedUserData);
  };

  // Handle back from biometric to normal login
  const handleBiometricBack = () => {
    setIsBiometricOpen(false);
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Employee Login Dialog */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-w-md mx-4 relative">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Employee Login
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Rangga"
                  className="w-full border-blue-500 focus:border-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Securely enter your password"
                    className="w-full pr-10 border-gray-300 focus:border-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                
                {/* Biometric Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBiometricClick}
                  className="px-4 border-blue-500 text-blue-500 hover:bg-blue-50"
                  disabled={isLoading}
                  title="Biometric Login"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Biometric Login Dialog */}
      <BiometricLoginDialog
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        onBack={handleBiometricBack}
        onSuccess={handleBiometricSuccess}
        scanDuration={3000}
      />
    </>
  );
}