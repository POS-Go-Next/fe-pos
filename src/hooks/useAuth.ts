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

// Function to get system MAC address from existing API
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
            // Try to get MAC addresses from the response
            let macAddress = null;

            // Method 1: Find active network interface with MAC address
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

            // Method 2: Fallback to macAddresses array
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

        // Check if it's a connection error
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

            // Get MAC address with enhanced method
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

            // Prepare payload with MAC address and token generation flag
            const loginPayload = {
                username: validatedData.username,
                password: validatedData.password,
                mac_address: macAddress || "00:00:00:00:00:00", // Fallback MAC
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

    return {
        login,
        isLoading,
        error,
    };
};
