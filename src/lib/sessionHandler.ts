// lib/sessionHandler.ts - FIXED VERSION
import { showErrorAlert } from "@/lib/swal";
import Swal from "sweetalert2";

// Custom session expired alert with timer - for general use
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
    // Handle the result
    if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
      // Redirect to login page or reload page
      handleSessionExpired();
    }
  });
};

// Handle session expired action
export const handleSessionExpired = () => {
  // ✅ Fix: Safe localStorage access
  if (typeof window !== "undefined") {
    localStorage.removeItem("user-data");
    localStorage.removeItem("auth-token");

    // Redirect to login page or dashboard
    window.location.href = "/";
  }
};

// Enhanced error handler for API responses with custom callback support
export const handleApiError = async (
  response: Response,
  data: any,
  customSessionHandler?: () => Promise<void>
) => {
  // Check for 401 Unauthorized (Session Expired)
  if (response.status === 401) {
    if (customSessionHandler) {
      // Use custom session handler if provided
      await customSessionHandler();
    } else {
      // Use default session expired alert
      await showSessionExpiredAlert();
    }
    return true; // Indicates session expired was handled
  }

  // Handle other errors with regular error alert
  await showErrorAlert(
    "Error",
    data.message || "An error occurred. Please try again.",
    "OK"
  );

  return false; // Indicates regular error was handled
};

// Check if error is session expired
export const isSessionExpired = (response: Response, data?: any): boolean => {
  return (
    response.status === 401 ||
    (data?.message && data.message.toLowerCase().includes("session expired")) ||
    (data?.message && data.message.toLowerCase().includes("unauthorized"))
  );
};

// Silent session check without popup
export const checkAuthenticationStatus = (): boolean => {
  if (typeof window === "undefined") return false;

  const authToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth-token="))
    ?.split("=")[1];

  return !!authToken;
};
