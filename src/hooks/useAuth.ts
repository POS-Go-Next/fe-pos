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

interface LogoutResponse {
  success: boolean;
  message: string;
}

type LoginType =
  | "parameter"
  | "fingerprint"
  | "kassa"
  | "close-cashier"
  | "reclose-cashier"
  | "sales";

interface UseAuthReturn {
  login: (credentials: LoginData) => Promise<LoginResponse>;
  loginForPopup: (
    credentials: LoginData,
    type: LoginType
  ) => Promise<LoginResponse>;
  logout: () => Promise<LogoutResponse>;
  isLoading: boolean;
  error: string | null;
}

const getSystemDeviceId = async (): Promise<string | null> => {
  try {const response = await fetch("http://localhost:8321/api/system/info");
    const data = await response.json();if (data.success && data.data && data.data.deviceConfig) {
      const deviceId = data.data.deviceConfig.deviceId;return deviceId;
    }

    console.warn(
      "⚠️ System info request failed:",
      data.message || "Unknown error"
    );
    return null;
  } catch (error) {
    console.error("❌ Error getting device ID:", error);

    if (error instanceof Error && error.message.includes("fetch")) {
      console.warn("⚠️ System service might not be running on localhost:8321");
    }

    return null;
  }
};

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginData): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = loginSchema.parse(credentials);const deviceId = await getSystemDeviceId();

      if (!deviceId) {
        console.warn("⚠️ Could not retrieve device ID from system service");
        console.warn("⚠️ This might happen if:");
        console.warn("   - System service is not running on localhost:8321");
        console.warn("   - Device configuration not found");
        console.warn("   - Network permission issues");
      }

      const loginPayload = {
        username: validatedData.username,
        password: validatedData.password,
        device_id: deviceId || "KASSA-0000-0000-0000",
        need_generate_token: true,
      };const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
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

  const loginForPopup = async (
    credentials: LoginData,
    type: LoginType
  ): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const validatedData = loginSchema.parse(credentials);const deviceId = await getSystemDeviceId();

      if (!deviceId) {
        console.warn("⚠️ Could not retrieve device ID from system service");
        console.warn("⚠️ This might happen if:");
        console.warn("   - System service is not running on localhost:8321");
        console.warn("   - Device configuration not found");
        console.warn("   - Network permission issues");
      }

      const loginPayload = {
        username: validatedData.username,
        password: validatedData.password,
        device_id: deviceId || "KASSA-0000-0000-0000",
        need_generate_token: true,
        ...(type === "sales" && { type: "sales" }),
      };const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
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

      return {
        success: false,
        message: data.message || "Login failed",
        errors: data.errors,
      };
    } catch (err) {
      console.error(`${type} login error:`, err);
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

  const logout = async (): Promise<LogoutResponse> => {
    setIsLoading(true);
    setError(null);

    try {const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      let apiMessage = "Logout completed";

      if (response.ok) {
        const data = await response.json();
        apiMessage = data.message || "Logout successful";
      } else {
        console.warn("⚠️ Logout API failed, but continuing with cleanup");
        apiMessage = "Logout completed (with warnings)";
      }

      try {
        localStorage.removeItem("user-data");
        localStorage.removeItem("auth-token");} catch (storageError) {
        console.error("❌ Failed to clear localStorage:", storageError);
      }

      return {
        success: true,
        message: apiMessage,
      };
    } catch (error) {
      console.warn("⚠️ Logout API error, but cleaning up anyway:", error);

      try {
        localStorage.removeItem("user-data");
        localStorage.removeItem("auth-token");} catch (storageError) {
        console.error("❌ Failed to clear localStorage:", storageError);
      }

      return {
        success: true,
        message: "Logout completed (offline)",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    loginForPopup,
    logout,
    isLoading,
    error,
  };
};
