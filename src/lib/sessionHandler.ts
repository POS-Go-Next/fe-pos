import { showErrorAlert } from "@/lib/swal";
import Swal from "sweetalert2";

export const showSessionExpiredAlert = () => {
    let timerInterval: NodeJS.Timeout;

    return Swal.fire({
        icon: "warning",
        title: "Session Expired",
        html: `
      <div class="text-sm text-gray-600 mb-4">
        Your session has expired. Please login again.
      </div>
      <div class="text-xs text-gray-500">
        This popup will close automatically in <strong id="timer">3</strong> seconds
      </div>
    `,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: "Login Now",
        confirmButtonColor: "#025CCA",
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
            popup: "rounded-xl shadow-2xl",
            confirmButton: "rounded-lg px-6 py-2 font-medium",
            title: "text-lg font-bold text-red-600",
            htmlContainer: "text-sm",
        },
        background: "#ffffff",
        color: "#1f2937",
        didOpen: () => {
            const timer = Swal.getPopup()?.querySelector("#timer");
            let remainingTime = 3;

            timerInterval = setInterval(() => {
                remainingTime--;
                if (timer) {
                    timer.textContent = remainingTime.toString();
                }

                if (remainingTime <= 0) {
                    clearInterval(timerInterval);
                }
            }, 1000);
        },
        willClose: () => {
            clearInterval(timerInterval);
        },
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
            handleSessionExpired();
        }
    });
};

export const handleSessionExpired = () => {
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem("user-data");
            localStorage.removeItem("auth-token");

            window.location.href = "/";
        } catch (error) {
            console.error("Error clearing localStorage:", error);
            window.location.href = "/";
        }
    }
};

export const handleLogout = async (): Promise<void> => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            console.warn("Logout API failed, proceeding with local cleanup");
        }
    } catch (error) {
        console.warn("Logout API error, proceeding with local cleanup:", error);
    } finally {
        handleSessionExpired();
    }
};

export const handleApiError = async (
    response: Response,
    data: any,
    customSessionHandler?: () => Promise<void>
) => {
    if (response.status === 401) {
        if (customSessionHandler) {
            await customSessionHandler();
        } else {
            await showSessionExpiredAlert();
        }
        return true;
    }

    await showErrorAlert(
        "Error",
        data.message || "An error occurred. Please try again.",
        "OK"
    );
};

export const isSessionExpired = (response: Response, data?: any): boolean => {
    return (
        response.status === 401 ||
        (data?.message &&
            data.message.toLowerCase().includes("session expired")) ||
        (data?.message && data.message.toLowerCase().includes("unauthorized"))
    );
};

export const checkAuthenticationStatus = (): boolean => {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return false;
    }

    try {
        const authToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth-token="))
            ?.split("=")[1];

        return !!authToken;
    } catch (error) {
        console.error("Error checking authentication status:", error);
        return false;
    }
};
