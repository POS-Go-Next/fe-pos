// hooks/useFingerprintAuth.ts
"use client";

import { useState } from "react";

interface FingerprintLoginRequest {
    device_id: string;
    need_generate_token?: boolean;
}

interface FingerprintUser {
    id: number;
    fullname: string;
    username: string;
    email: string;
    phone: string;
    role_id: number;
    position_id: number;
}

interface FingerprintLoginResponse {
    success: boolean;
    message: string;
    data?: {
        user: FingerprintUser;
        token: string;
        sessionId: string;
        expiresAt: string;
    };
    errors?: any;
}

interface UseFingerprintAuthReturn {
    fingerprintLogin: (
        request: FingerprintLoginRequest
    ) => Promise<FingerprintLoginResponse>;
    isLoading: boolean;
    error: string | null;
}

export const useFingerprintAuth = (): UseFingerprintAuthReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fingerprintLogin = async (
        request: FingerprintLoginRequest
    ): Promise<FingerprintLoginResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("🔐 Starting fingerprint login:", {
                device_id: request.device_id,
                need_generate_token: request.need_generate_token,
                timestamp: new Date().toISOString(),
            });

            const response = await fetch("/api/auth/fingerprint", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(request),
            });

            const data: FingerprintLoginResponse = await response.json();

            console.log("🔐 Fingerprint login response:", {
                success: data.success,
                message: data.message,
                hasUser: !!data.data?.user,
                hasToken: !!data.data?.token,
            });

            if (!response.ok) {
                setError(data.message || "Fingerprint login failed");
                return {
                    success: false,
                    message: data.message || "Fingerprint login failed",
                    errors: data.errors,
                };
            }

            if (data.success && data.data) {
                // Save user data and token to localStorage for client-side access
                try {
                    localStorage.setItem(
                        "user-data",
                        JSON.stringify(data.data.user)
                    );
                    localStorage.setItem("auth-token", data.data.token);

                    console.log(
                        "✅ Fingerprint login successful - User data saved:",
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

            setError(data.message || "Fingerprint login failed");
            return {
                success: false,
                message: data.message || "Fingerprint login failed",
                errors: data.errors,
            };
        } catch (err) {
            console.error("❌ Fingerprint login error:", err);

            let errorMessage = "Fingerprint login failed";

            if (err instanceof TypeError && err.message.includes("fetch")) {
                errorMessage = "Network error. Please check your connection.";
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

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
        fingerprintLogin,
        isLoading,
        error,
    };
};
