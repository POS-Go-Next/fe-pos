// types/systemInfo.ts
export interface NetworkInterface {
    name: string;
    ipAddress: string;
    macAddress: string;
    isUp: boolean;
    isLoopback: boolean;
}

export interface OSInfo {
    platform: string;
    architecture: string;
    numCPU: number;
}

export interface SystemInfoData {
    hostname: string;
    ipAddresses: NetworkInterface[];
    macAddresses: string[];
    osInfo: OSInfo;
    workingDir: string;
    timestamp: string;
}

export interface SystemInfoResponse {
    success: boolean;
    data?: SystemInfoData;
    message?: string;
}

export interface SystemInfoError {
    success: false;
    message: string;
}
