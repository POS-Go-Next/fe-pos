// lib/schemas.ts
import { z } from "zod";

// Login schema
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

// API Response schemas - Updated to match actual API response
export const loginResponseSchema = z.object({
  message: z.string(),
  data: z.object({
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
  }).optional(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Error response schema
export const errorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
});