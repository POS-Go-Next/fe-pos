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
    goVersion: string;
    numCPU: number;
}

export interface DeviceConfig {
    deviceId: string;
    deviceName: string;
    grpcServerHost: string;
    grpcServerPort: number;
    grpcTlsEnabled: boolean;
    grpcCertPath: string;
    version: string;
    logRetentionDays: number;
    createdAt: string;
    updatedAt: string;
}

export interface SystemInfoData {
    hostname: string;
    ipAddresses: NetworkInterface[];
    macAddresses: string[];
    osInfo: OSInfo;
    workingDir: string;
    deviceConfig: DeviceConfig;
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
