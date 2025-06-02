// hooks/useAuth.ts
'use client';

import { useState } from "react";
import { LoginData } from "@/lib/schemas";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "@/lib/swal";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      name?: string;
      role?: string;
      email?: string;
    };
    sessionId: string;
    expiresAt: Date;
    token?: string;
  };
  errors?: Record<string, string[]>;
}

interface UseAuthReturn {
  login: (data: LoginData) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: null; // SweetAlert2 handles errors now
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginData): Promise<LoginResponse> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Show error with SweetAlert2
        await showErrorAlert(
          'Login Failed',
          result.message || "Login failed. Please try again.",
          'Try Again'
        );
        return result;
      }

      // Show success message
      await showSuccessAlert(
        'Login Successful!',
        'Welcome to Apotek POS System',
        1500
      );

      return result;
    } catch (err) {
      const errorMessage = "Network error. Please check your connection.";
      
      // Show network error with SweetAlert2
      await showErrorAlert(
        'Connection Error',
        errorMessage,
        'Retry'
      );

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    // Show confirmation dialog
    const result = await showConfirmAlert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      'Yes, Logout',
      'Cancel'
    );

    if (!result.isConfirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Show success message
      await showSuccessAlert(
        'Logged Out',
        'You have been successfully logged out',
        1500
      );

      // Redirect to login page or refresh
      window.location.href = "/";
    } catch (err) {
      // Show error message
      await showErrorAlert(
        'Logout Failed',
        'Logout failed. Please try again.',
        'OK'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error: null, // SweetAlert2 handles error display now
  };
}