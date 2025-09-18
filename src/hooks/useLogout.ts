"use client";

import { useState } from "react";
import {
    showConfirmAlert,
    showLoadingAlert,
    showSuccessAlert,
} from "@/lib/swal";
import Swal from "sweetalert2";

interface UseLogoutReturn {
    logout: () => Promise<void>;
    isLoading: boolean;
}

export const useLogout = (): UseLogoutReturn => {
    const [isLoading, setIsLoading] = useState(false);

    const logout = async () => {
        try {
            const result = await showConfirmAlert(
                "Confirm Logout",
                "Are you sure you want to logout from this session?",
                "Yes, Logout",
                "Cancel"
            );

            if (!result.isConfirmed) {
                return;
            }

            setIsLoading(true);

            showLoadingAlert(
                "Logging out...",
                "Please wait while we log you out safely."
            );

            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            if (typeof window !== "undefined") {
                localStorage.removeItem("user-data");
                localStorage.removeItem("auth-token");
                localStorage.removeItem("pos-products");
                localStorage.removeItem("pos-next-id");
            }

            Swal.close();

            await showSuccessAlert(
                "Logged out successfully!",
                "You have been safely logged out.",
                1500
            );

            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout error:", error);
            Swal.close();

            if (typeof window !== "undefined") {
                localStorage.removeItem("user-data");
                localStorage.removeItem("auth-token");
                localStorage.removeItem("pos-products");
                localStorage.removeItem("pos-next-id");
            }

            await showSuccessAlert(
                "Logged out",
                "You have been logged out.",
                1500
            );

            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        logout,
        isLoading,
    };
};
