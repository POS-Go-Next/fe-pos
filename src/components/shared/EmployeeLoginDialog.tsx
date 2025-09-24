"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { showErrorAlert } from "@/lib/swal";
import BiometricLoginDialog from "@/app/dashboard/_components/BiometricLoginDialog";

type LoginType =
  | "parameter"
  | "fingerprint"
  | "kassa"
  | "close-cashier"
  | "reclose-cashier"
  | "sales";

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
  loginType?: LoginType;
}

export default function EmployeeLoginDialog({
  isOpen,
  onClose,
  onLogin,
  loginType = "parameter",
}: EmployeeLoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);

  const { loginForPopup, isLoading } = useAuth();

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
      const result = await loginForPopup({ username, password }, loginType);

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

  const handleBiometricClick = () => {
    setIsBiometricOpen(true);
  };

  const handleBiometricSuccess = (userData: any) => {
    setIsBiometricOpen(false);

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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-[#f5f5f5] rounded-2xl w-full max-w-[408px] mx-4 relative shadow-2xl p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-semibold text-gray-900">
              Employee Login
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-black hover:scale-105 transition-all"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl p-5 space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Input your Username"
                  className="w-full bg-[#F5F5F5] h-[52px] border-none focus:border-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Input your Password"
                    className="w-full pr-10 bg-[#F5F5F5] border-none h-[52px] focus:border-blue-600 focus:ring-blue-500"
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
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-[44px] max-w-max px-7"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBiometricClick}
                className="px-4 bg-[#E6ECFE] hover:bg-[#cbd7fb] text-blue-700 hover:text-blue-900 h-[44px]"
                disabled={isLoading}
                title="Biometric Login"
              >
                <svg
                  className="w-8 h-8"
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

      <BiometricLoginDialog
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        onBack={handleBiometricBack}
        onSuccess={handleBiometricSuccess}
        scanDuration={3000}
        loginType={loginType}
      />
    </>
  );
}
