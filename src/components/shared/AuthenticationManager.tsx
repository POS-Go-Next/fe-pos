// components/shared/AuthenticationManager.tsx - DIRECT AUTH CHECK
"use client";

import { useState, useCallback } from "react";
import { UserData } from "@/types/user";
import Swal from "sweetalert2";

interface AuthState {
  hasValidToken: boolean;
  isLoginDialogOpen: boolean;
  isCheckingAuth: boolean;
}

export const useAuthManager = () => {
  const [authState, setAuthState] = useState<AuthState>({
    hasValidToken: false,
    isLoginDialogOpen: false,
    isCheckingAuth: false, // 🔥 FIX: Start with false, no loading screen
  });

  const showSessionExpiredDialog = useCallback(() => {
    Swal.fire({
      icon: "warning",
      title: "Session Expired",
      html: `
        <div class="text-sm text-gray-600 mb-4">
          Your session has expired. Please login again to continue.
        </div>
        <div class="text-xs text-gray-500">
          Auto-closing in <strong id="timer">3</strong> seconds
        </div>
      `,
      timer: 3000,
      timerProgressBar: true,
      confirmButtonText: "Login Now",
      confirmButtonColor: "#025CCA",
      allowOutsideClick: false,
      didOpen: () => {
        const timer = Swal.getPopup()?.querySelector("#timer");
        let remainingTime = 3;
        const interval = setInterval(() => {
          remainingTime--;
          if (timer) timer.textContent = remainingTime.toString();
          if (remainingTime <= 0) clearInterval(interval);
        }, 1000);
      },
    }).then(() => {
      setAuthState((prev) => ({ ...prev, isLoginDialogOpen: true }));
    });
  }, []);

  // 🔥 FIX: Quick client-side token check first
  const quickTokenCheck = useCallback(() => {
    if (typeof window === "undefined") return false;

    try {
      // Check if there's any auth token in cookies
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth-token="));

      // Check localStorage for user data
      const userData = localStorage.getItem("user-data");

      return !!(authToken && userData);
    } catch (error) {
      return false;
    }
  }, []);

  const checkAuthentication = useCallback(async () => {
    console.log("🔍 Quick authentication check...");

    // 🔥 FIX: Quick client-side check first
    const hasLocalAuth = quickTokenCheck();

    if (!hasLocalAuth) {
      console.log(
        "❌ No local auth found, showing session expired immediately"
      );
      setAuthState({
        hasValidToken: false,
        isLoginDialogOpen: false,
        isCheckingAuth: false,
      });
      showSessionExpiredDialog();
      return;
    }

    // 🔥 FIX: Only do API check if local auth exists, and do it quickly
    try {
      console.log("🔄 Verifying with server...");

      const response = await fetch("/api/user?limit=1&offset=0", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // 🔥 FIX: Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        console.log("✅ Server auth confirmed");
        setAuthState({
          hasValidToken: true,
          isLoginDialogOpen: false,
          isCheckingAuth: false,
        });
      } else {
        console.log("❌ Server auth failed, status:", response.status);
        throw new Error(`Server auth failed: ${response.status}`);
      }
    } catch (error) {
      console.log("❌ Auth verification failed:", error);

      // 🔥 FIX: Clear local storage if server auth fails
      try {
        localStorage.removeItem("user-data");
        localStorage.removeItem("auth-token");
      } catch (e) {
        console.log("Could not clear localStorage:", e);
      }

      setAuthState({
        hasValidToken: false,
        isLoginDialogOpen: false,
        isCheckingAuth: false,
      });
      showSessionExpiredDialog();
    }
  }, [quickTokenCheck, showSessionExpiredDialog]);

  const handleLoginSuccess = useCallback((userData: UserData) => {
    console.log("✅ Login successful:", userData);
    setAuthState({
      hasValidToken: true,
      isLoginDialogOpen: false,
      isCheckingAuth: false,
    });
  }, []);

  const handleLoginClose = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isLoginDialogOpen: false }));
  }, []);

  const resetAuth = useCallback(() => {
    setAuthState({
      hasValidToken: false,
      isLoginDialogOpen: false,
      isCheckingAuth: false, // 🔥 FIX: No loading on reset
    });
  }, []);

  return {
    authState,
    checkAuthentication,
    handleLoginSuccess,
    handleLoginClose,
    resetAuth,
  };
};
