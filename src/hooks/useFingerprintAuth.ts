"use client";

import { useState } from "react";

interface FingerprintLoginRequest {
  device_id: string;
  need_generate_token?: boolean;
  type?: string;
}

interface FingerprintUser {
  id: number;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  role_id: number;
  position_id: number;
}

interface FingerprintLoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: FingerprintUser;
    token: string;
    sessionId: string;
    expiresAt: string;
  };
  errors?: Record<string, string[]>;
}

interface UseFingerprintAuthReturn {
  fingerprintLogin: (
    request: FingerprintLoginRequest
  ) => Promise<FingerprintLoginResponse>;
  isLoading: boolean;
  error: string | null;
}

export const useFingerprintAuth = (): UseFingerprintAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fingerprintLogin = async (
    request: FingerprintLoginRequest
  ): Promise<FingerprintLoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {const response = await fetch("/api/auth/fingerprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(request),
      });

      const data: FingerprintLoginResponse = await response.json();if (!response.ok) {
        setError(data.message || "Fingerprint login failed");
        return {
          success: false,
          message: data.message || "Fingerprint login failed",
          errors: data.errors,
        };
      }

      if (data.success && data.data) {
        // Save user data and token to localStorage for client-side access
        try {
          localStorage.setItem("user-data", JSON.stringify(data.data.user));
          localStorage.setItem("auth-token", data.data.token);} catch (storageError) {
          console.error(
            "❌ Failed to save user data to localStorage:",
            storageError
          );
        }

        return {
          success: true,
          message: data.message,
          data: data.data,
        };
      }

      setError(data.message || "Fingerprint login failed");
      return {
        success: false,
        message: data.message || "Fingerprint login failed",
        errors: data.errors,
      };
    } catch (err) {
      console.error("❌ Fingerprint login error:", err);

      let errorMessage = "Fingerprint login failed";

      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fingerprintLogin,
    isLoading,
    error,
  };
};
