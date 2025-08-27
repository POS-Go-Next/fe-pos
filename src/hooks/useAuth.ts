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

interface LogoutResponse {
    success: boolean;
    message: string;
}

interface UseAuthReturn {
    login: (credentials: LoginData) => Promise<LoginResponse>;
    logout: () => Promise<LogoutResponse>;
    isLoading: boolean;
    error: string | null;
}

const getSystemMacAddress = async (): Promise<string | null> => {
    try {
        console.log("🔍 Fetching system info for MAC address...");

        const response = await fetch("http://localhost:8321/api/system/info");
        const data = await response.json();

        console.log("📡 System info response:", {
            success: data.success,
            hasData: !!data.data,
            ipAddressesCount: data.data?.ipAddresses?.length || 0,
        });

        if (data.success && data.data) {
            let macAddress = null;

            if (data.data.ipAddresses && Array.isArray(data.data.ipAddresses)) {
                const activeInterface = data.data.ipAddresses.find(
                    (iface: any) =>
                        !iface.isLoopback &&
                        iface.macAddress &&
                        iface.isUp &&
                        iface.macAddress !== "00:00:00:00:00:00" &&
                        !iface.name?.toLowerCase().includes("virtual") &&
                        !iface.name?.toLowerCase().includes("docker")
                );

                if (activeInterface) {
                    macAddress = activeInterface.macAddress;
                    console.log("✅ Found active interface MAC:", macAddress);
                }
            }

            if (
                !macAddress &&
                data.data.macAddresses &&
                Array.isArray(data.data.macAddresses)
            ) {
                const validMac = data.data.macAddresses.find(
                    (mac: string) => mac && mac !== "00:00:00:00:00:00"
                );

                if (validMac) {
                    macAddress = validMac;
                    console.log("✅ Found MAC from array:", macAddress);
                }
            }

            return macAddress;
        }

        console.warn(
            "⚠️ System info request failed:",
            data.message || "Unknown error"
        );
        return null;
    } catch (error) {
        console.error("❌ Error getting MAC address:", error);

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

            console.log("🔍 Attempting to get MAC address...");
            const macAddress = await getSystemMacAddress();

            if (!macAddress) {
                console.warn(
                    "⚠️ Could not retrieve MAC address from system service"
                );
                console.warn("⚠️ This might happen if:");
                console.warn(
                    "   - System service is not running on localhost:8321"
                );
                console.warn("   - No valid network interfaces found");
                console.warn("   - Network permission issues");
            }

            const loginPayload = {
                username: validatedData.username,
                password: validatedData.password,
                mac_address: macAddress || "00:00:00:00:00:00",
                need_generate_token: true,
            };

            console.log("🚀 Sending login payload:", {
                username: loginPayload.username,
                mac_address: loginPayload.mac_address,
                mac_address_source: macAddress ? "system_service" : "fallback",
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

    const logout = async (): Promise<LogoutResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("🔄 Starting logout process...");

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
        logout,
        isLoading,
        error,
    };
};
