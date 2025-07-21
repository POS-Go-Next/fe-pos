// hooks/useAuth.ts
"use client";

import { loginSchema, type LoginData } from "@/lib/schemas";
import { useState } from "react";

interface UserData {
  id: number;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  role_id: number;
  position_id: number;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserData;
    token: string;
  };
  errors?: Record<string, string[]>;
}

interface UseAuthReturn {
  login: (credentials: LoginData) => Promise<LoginResponse>;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginData): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = loginSchema.parse(credentials);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Login failed",
          errors: data.errors,
        };
      }

      if (data.success && data.data) {
        try {
          localStorage.setItem("user-data", JSON.stringify(data.data.user));
          localStorage.setItem("auth-token", data.data.token);

          console.log("✅ Login successful - User data saved:", {
            username: data.data.user.username,
            fullname: data.data.user.fullname,
            id: data.data.user.id,
          });
        } catch (storageError) {
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

      return {
        success: false,
        message: data.message || "Login failed",
        errors: data.errors,
      };
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
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
    login,
    isLoading,
    error,
  };
};
