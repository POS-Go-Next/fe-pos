"use client";

import { useState, useCallback, useRef } from "react";
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
        isCheckingAuth: false,
    });

    const isCheckingRef = useRef(false);

    const showSessionExpiredDialog = useCallback(() => {
        if (isCheckingRef.current) return;

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
            setAuthState((prev) => ({
                ...prev,
                isLoginDialogOpen: true,
                isCheckingAuth: false,
            }));
        });
    }, []);

    const quickTokenCheck = useCallback(() => {
        if (typeof window === "undefined") return false;

        try {
            const authToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("auth-token="));

            const userData = localStorage.getItem("user-data");

            return !!(authToken && userData);
        } catch (error) {
            return false;
        }
    }, []);

    const checkAuthentication = useCallback(async () => {
        if (isCheckingRef.current) {
            console.log("🔄 Auth check already in progress, skipping...");
            return;
        }

        isCheckingRef.current = true;
        console.log("🔍 Starting authentication check...");

        setAuthState((prev) => ({
            ...prev,
            isCheckingAuth: true,
        }));

        const hasLocalAuth = quickTokenCheck();

        if (!hasLocalAuth) {
            console.log("❌ No local auth found, showing session expired");
            setAuthState({
                hasValidToken: false,
                isLoginDialogOpen: false,
                isCheckingAuth: false,
            });
            isCheckingRef.current = false;
            showSessionExpiredDialog();
            return;
        }

        try {
            console.log("🔄 Verifying with server...");

            const response = await fetch("/api/user?limit=1&offset=0", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                signal: AbortSignal.timeout(5000),
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
        } finally {
            isCheckingRef.current = false;
        }
    }, [quickTokenCheck, showSessionExpiredDialog]);

    const handleLoginSuccess = useCallback((userData: UserData) => {
        console.log("✅ Login successful:", userData);
        setAuthState({
            hasValidToken: true,
            isLoginDialogOpen: false,
            isCheckingAuth: false,
        });
        isCheckingRef.current = false;
    }, []);

    const handleLoginClose = useCallback(() => {
        console.log("❌ Login dialog closed");
        setAuthState((prev) => ({
            ...prev,
            isLoginDialogOpen: false,
            isCheckingAuth: false,
        }));
        isCheckingRef.current = false;
    }, []);

    const resetAuth = useCallback(() => {
        console.log("🔄 Resetting auth state");
        setAuthState({
            hasValidToken: false,
            isLoginDialogOpen: false,
            isCheckingAuth: false,
        });
        isCheckingRef.current = false;
    }, []);

    return {
        authState,
        checkAuthentication,
        handleLoginSuccess,
        handleLoginClose,
        resetAuth,
    };
};
