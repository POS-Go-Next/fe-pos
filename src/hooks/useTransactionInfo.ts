// hooks/useTransactionInfo.ts
"use client";

import { useState, useEffect } from "react";

interface KassaData {
    id_kassa: number;
    kd_cab: string;
    no_kassa: number;
    type_jual: string;
    antrian: boolean;
    status_aktif: boolean;
    status_operasional: string;
    tanggal_update: string;
    user_update: string;
    status: string;
    finger: string;
    default_jual: string;
    ip_address: string;
    mac_address: string;
    printer_id?: number;
    printer?: {
        id: number;
        nm_printer: string;
        status: boolean;
    };
}

interface NetworkInterface {
    name: string;
    ipAddress: string;
    macAddress: string;
    isUp: boolean;
    isLoopback: boolean;
}

interface SystemInfoData {
    hostname: string;
    ipAddresses: NetworkInterface[];
    macAddresses: string[];
    osInfo: {
        platform: string;
        architecture: string;
        numCPU: number;
    };
    workingDir: string;
    timestamp: string;
}

interface SystemInfoResponse {
    success: boolean;
    data: SystemInfoData;
}

interface QueueData {
    queue_number: number;
}

interface InvoiceData {
    invoice_number: string;
}

interface KassaApiResponse {
    success: boolean;
    message: string;
    data: KassaData;
}

interface QueueApiResponse {
    message: string;
    data: QueueData;
}

interface InvoiceApiResponse {
    message: string;
    data: InvoiceData;
}

interface UseTransactionInfoReturn {
    invoiceNumber: string;
    counterInfo: string;
    queueNumber: number | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useTransactionInfo = (): UseTransactionInfoReturn => {
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [counterInfo, setCounterInfo] = useState("#guest/0");
    const [queueNumber, setQueueNumber] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getSystemMacAddress = async (): Promise<string | null> => {
        try {
            console.log("🔄 Fetching MAC address from system service...");

            const response = await fetch("http://localhost:8321/api/system/info", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                const data: SystemInfoResponse = await response.json();
                if (data.success && data.data.ipAddresses) {
                    // Find first non-loopback interface with MAC address
                    const activeInterface = data.data.ipAddresses.find(
                        (iface) =>
                            !iface.isLoopback && iface.macAddress && iface.isUp
                    );

                    if (activeInterface) {
                        console.log(
                            "✅ Found MAC address:",
                            activeInterface.macAddress
                        );
                        return activeInterface.macAddress;
                    }

                    // Fallback: use first available MAC address
                    if (
                        data.data.macAddresses &&
                        data.data.macAddresses.length > 0
                    ) {
                        console.log(
                            "✅ Using fallback MAC address:",
                            data.data.macAddresses[0]
                        );
                        return data.data.macAddresses[0];
                    }
                }
            }

            console.warn("⚠️ Could not get MAC address from system service");
            return null;
        } catch (error) {
            console.error("❌ Error fetching system MAC address:", error);
            return null;
        }
    };

    const getUsername = (): string => {
        try {
            const userData = localStorage.getItem("user-data");
            if (userData) {
                const parsedData = JSON.parse(userData);
                return parsedData.username || "guest";
            }
            return "guest";
        } catch {
            return "guest";
        }
    };

    const fetchTransactionInfo = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const username = getUsername();

            // Step 1: Get real MAC address from system service
            const macAddress = await getSystemMacAddress();

            if (!macAddress) {
                throw new Error("Could not obtain MAC address from system");
            }

            console.log("🔄 Using MAC address:", macAddress);

            // Step 2: Fetch all 3 APIs in parallel using the real MAC address
            const [kassaResponse, queueResponse, invoiceResponse] =
                await Promise.all([
                    // 1. Get Kassa info by MAC address
                    fetch(`/api/kassa/${macAddress}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }),

                    // 2. Get next queue counter
                    fetch("/api/queue/next-counter", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }),

                    // 3. Get next invoice number
                    fetch("/api/transaction/next-invoice?transaction_type=1", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }),
                ]);

            // Process Kassa response
            let noKassa = "0";
            if (kassaResponse.ok) {
                const kassaData: KassaApiResponse = await kassaResponse.json();
                if (kassaData.success && kassaData.data) {
                    noKassa = kassaData.data.no_kassa.toString();
                    console.log("✅ Kassa data:", {
                        id_kassa: kassaData.data.id_kassa,
                        no_kassa: kassaData.data.no_kassa,
                        mac_address: kassaData.data.mac_address,
                    });
                }
            } else {
                console.warn("⚠️ Kassa API failed:", kassaResponse.status);
                if (kassaResponse.status === 404) {
                    console.log("🔍 Kassa not found for MAC:", macAddress);
                }
                noKassa = "1"; // Default counter number
            }

            // Process Queue response
            if (queueResponse.ok) {
                const queueData: QueueApiResponse = await queueResponse.json();
                setQueueNumber(queueData.data.queue_number);
                console.log("✅ Queue number:", queueData.data.queue_number);
            } else {
                console.warn("⚠️ Queue API failed, using fallback");
                setQueueNumber(1);
            }

            // Process Invoice response
            if (invoiceResponse.ok) {
                const invoiceData: InvoiceApiResponse =
                    await invoiceResponse.json();
                setInvoiceNumber(invoiceData.data.invoice_number);
                console.log(
                    "✅ Invoice number:",
                    invoiceData.data.invoice_number
                );
            } else {
                console.warn("⚠️ Invoice API failed, using fallback");
                setInvoiceNumber("S25080315");
            }

            // Set counter info with username and no_kassa
            setCounterInfo(`#${username}/${noKassa}`);
        } catch (err) {
            console.error("❌ Error fetching transaction info:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch transaction info"
            );

            // Set fallback values
            const username = getUsername();
            setCounterInfo(`#${username}/0`);
            setQueueNumber(1);
            setInvoiceNumber("S25080315");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactionInfo();
    }, []);

    const refetch = () => {
        fetchTransactionInfo();
    };

    return {
        invoiceNumber,
        counterInfo,
        queueNumber,
        isLoading,
        error,
        refetch,
    };
};
