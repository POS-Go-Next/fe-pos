// hooks/useSystemInfo.ts
"use client";

import { useState, useEffect } from "react";
import type {
    SystemInfoData,
    SystemInfoResponse,
    SystemInfoError,
} from "@/types/systemInfo";

interface UseSystemInfoReturn {
    systemInfo: SystemInfoData | null;
    macAddress: string | null;
    ipAddress: string | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useSystemInfo = (): UseSystemInfoReturn => {
    const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null);
    const [macAddress, setMacAddress] = useState<string | null>(null);
    const [ipAddress, setIpAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSystemInfo = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("🔄 Fetching system info...");

            const response = await fetch("/api/system-info", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch system info: ${response.status}`
                );
            }

            const result: SystemInfoResponse = await response.json();

            if (!result.success || !result.data) {
                throw new Error(
                    result.message || "Invalid system info response"
                );
            }

            console.log("✅ System info fetched:", result.data);

            setSystemInfo(result.data);

            // Get first active network interface
            const activeInterface =
                result.data.ipAddresses.find(
                    (iface) => iface.isUp && !iface.isLoopback
                ) || result.data.ipAddresses[0];

            if (activeInterface) {
                setMacAddress(activeInterface.macAddress);
                setIpAddress(activeInterface.ipAddress);
                console.log("📡 Active interface:", {
                    mac: activeInterface.macAddress,
                    ip: activeInterface.ipAddress,
                });
            } else {
                console.warn("⚠️ No active network interface found");
            }
        } catch (err) {
            console.error("❌ Error fetching system info:", err);

            let errorMessage = "Failed to get system information";

            if (err instanceof Error) {
                if (err.message.includes("fetch")) {
                    errorMessage =
                        "Cannot connect to system service. Please ensure the service is running.";
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemInfo();
    }, []);

    return {
        systemInfo,
        macAddress,
        ipAddress,
        isLoading,
        error,
        refetch: fetchSystemInfo,
    };
};
