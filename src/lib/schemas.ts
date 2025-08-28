// lib/schemas.ts
import { z } from "zod";

// Login schema - Base schema for form validation
export const loginSchema = z.object({
    username: z
        .string()
        .min(1, "Username is required")
        .max(50, "Username must be less than 50 characters"),
    password: z
        .string()
        .min(1, "Password is required")
        .max(100, "Password must be less than 100 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Extended login schema for API payload (includes device ID)
export const loginApiPayloadSchema = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(1).max(100),
    device_id: z.string().min(1, "Device ID is required"),
    need_generate_token: z.boolean().default(true),
});

export type LoginApiPayload = z.infer<typeof loginApiPayloadSchema>;

// Device ID validation schema  
export const deviceIdSchema = z
    .string()
    .regex(
        /^KASSA-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/,
        "Invalid device ID format"
    );

// MAC address validation schema (keeping for backwards compatibility)
export const macAddressSchema = z
    .string()
    .regex(
        /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
        "Invalid MAC address format"
    );

// API Response schemas - Updated to match actual API response
export const loginResponseSchema = z.object({
    message: z.string(),
    data: z
        .object({
            user: z.object({
                id: z.number(),
                fullname: z.string(),
                username: z.string(),
                email: z.string(),
                phone: z.string(),
                role_id: z.number(),
                position_id: z.number(),
            }),
            token: z.string(),
        })
        .optional(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Error response schema
export const errorResponseSchema = z.object({
    message: z.string(),
    errors: z.record(z.array(z.string())).optional(),
});

// System info response schema - Updated to match actual API structure
export const systemInfoResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z
        .object({
            hostname: z.string(),
            ipAddresses: z.array(
                z.object({
                    name: z.string(),
                    ipAddress: z.string(),
                    macAddress: z.string(),
                    isUp: z.boolean(),
                    isLoopback: z.boolean(),
                })
            ),
            macAddresses: z.array(z.string()),
            osInfo: z.object({
                platform: z.string(),
                architecture: z.string(),
                goVersion: z.string(),
                numCPU: z.number(),
            }),
            workingDir: z.string(),
            deviceConfig: z.object({
                deviceId: z.string(),
                deviceName: z.string(),
                grpcServerHost: z.string(),
                grpcServerPort: z.number(),
                grpcTlsEnabled: z.boolean(),
                grpcCertPath: z.string(),
                version: z.string(),
                logRetentionDays: z.number(),
                createdAt: z.string(),
                updatedAt: z.string(),
            }),
            timestamp: z.string(),
        })
        .optional(),
});

export type SystemInfoResponse = z.infer<typeof systemInfoResponseSchema>;
