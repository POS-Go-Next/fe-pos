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
    try {
        console.log("🔍 Fetching system info for device ID...");

        const response = await fetch("http://localhost:8321/api/system/info");
        const data = await response.json();

        console.log("📡 System info response:", {
            success: data.success,
            hasData: !!data.data,
            hasDeviceConfig: !!data.data?.deviceConfig,
        });

        if (data.success && data.data && data.data.deviceConfig) {
            const deviceId = data.data.deviceConfig.deviceId;
            console.log("✅ Found device ID:", deviceId);
            return deviceId;
        }

        console.warn(
            "⚠️ System info request failed:",
            data.message || "Unknown error"
        );
        return null;
    } catch (error) {
        console.error("❌ Error getting device ID:", error);

        if (error instanceof Error && error.message.includes("fetch")) {
            console.warn(
                "⚠️ System service might not be running on localhost:8321"
            );
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
            const validatedData = loginSchema.parse(credentials);

            console.log("🔍 Attempting to get device ID...");
            const deviceId = await getSystemDeviceId();

            if (!deviceId) {
                console.warn(
                    "⚠️ Could not retrieve device ID from system service"
                );
                console.warn("⚠️ This might happen if:");
                console.warn(
                    "   - System service is not running on localhost:8321"
                );
                console.warn("   - Device configuration not found");
                console.warn("   - Network permission issues");
            }

            const loginPayload = {
                username: validatedData.username,
                password: validatedData.password,
                device_id: deviceId || "KASSA-0000-0000-0000",
                need_generate_token: true,
            };

            console.log("🚀 Sending login payload:", {
                username: loginPayload.username,
                device_id: loginPayload.device_id,
                device_id_source: deviceId ? "system_service" : "fallback",
                need_generate_token: loginPayload.need_generate_token,
            });

            const response = await fetch("/api/auth/login", {
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
                    localStorage.setItem(
                        "user-data",
                        JSON.stringify(data.data.user)
                    );
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
            const errorMessage =
                err instanceof Error ? err.message : "Login failed";
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
            const validatedData = loginSchema.parse(credentials);

            console.log(`🔍 Attempting to get device ID for ${type} popup...`);
            const deviceId = await getSystemDeviceId();

            if (!deviceId) {
                console.warn(
                    "⚠️ Could not retrieve device ID from system service"
                );
                console.warn("⚠️ This might happen if:");
                console.warn(
                    "   - System service is not running on localhost:8321"
                );
                console.warn("   - Device configuration not found");
                console.warn("   - Network permission issues");
            }

            const baseLoginPayload = {
                username: validatedData.username,
                password: validatedData.password,
                device_id: deviceId || "KASSA-0000-0000-0000",
                need_generate_token: true,
            };

            const loginPayload =
                type === "sales"
                    ? { ...baseLoginPayload, type: "sales" }
                    : baseLoginPayload;

            console.log(`🚀 Sending ${type} login payload:`, {
                username: loginPayload.username,
                device_id: loginPayload.device_id,
                device_id_source: deviceId ? "system_service" : "fallback",
                need_generate_token: loginPayload.need_generate_token,
                type: type,
                ...(type === "sales" && { type_field: "sales" }),
            });

            const response = await fetch("/api/auth/login", {
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
                    localStorage.setItem(
                        "user-data",
                        JSON.stringify(data.data.user)
                    );
                    localStorage.setItem("auth-token", data.data.token);

                    console.log(
                        `✅ ${type} login successful - User data saved:`,
                        {
                            username: data.data.user.username,
                            fullname: data.data.user.fullname,
                            id: data.data.user.id,
                        }
                    );
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
            console.error(`${type} login error:`, err);
            const errorMessage =
                err instanceof Error ? err.message : "Login failed";
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

        try {
            console.log("🔥 Starting logout process...");

            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            let apiSuccess = false;
            let apiMessage = "Logout completed";

            if (response.ok) {
                const data = await response.json();
                apiSuccess = data.success;
                apiMessage = data.message || "Logout successful";
                console.log("✅ Logout API call successful");
            } else {
                console.warn(
                    "⚠️ Logout API failed, but continuing with cleanup"
                );
                apiMessage = "Logout completed (with warnings)";
            }

            try {
                localStorage.removeItem("user-data");
                localStorage.removeItem("auth-token");
                console.log("✅ Local storage cleaned up");
            } catch (storageError) {
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
                localStorage.removeItem("auth-token");
                console.log("✅ Local storage cleaned up after API error");
            } catch (storageError) {
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
