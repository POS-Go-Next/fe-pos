// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas";
import { createSession, type AppUser } from "@/lib/auth";
import { ZodError } from "zod";
import { cookies } from "next/headers";

const API_BASE_URL = "http://localhost:8081/api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = loginSchema.parse(body);

        console.log("🚀 LOGIN API - Received request:", {
            username: validatedData.username,
            mac_address: body.mac_address,
            timestamp: new Date().toISOString(),
        });

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                ...validatedData,
                mac_address: body.mac_address,
                need_generate_token: true,
            }),
        });

        const responseData = await response.json();
        console.log("📥 LOGIN API - External response:", {
            status: response.status,
            success: response.ok,
            message: responseData.message,
            mac_sent: body.mac_address,
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: responseData.message || "Login failed",
                    errors: responseData.errors,
                },
                { status: response.status }
            );
        }

        if (responseData.message !== "Login successful" || !responseData.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: responseData.message || "Login failed",
                },
                { status: 400 }
            );
        }

        const apiUser = responseData.data.user;
        const userData: AppUser = {
            id: apiUser.id.toString(),
            username: apiUser.username,
            name: apiUser.fullname,
            role: apiUser.role_id?.toString(),
            email: apiUser.email,
        };

        const session = await createSession(userData.id, userData);

        const cookieStore = cookies();
        if (responseData.data.token) {
            cookieStore.set("auth-token", responseData.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Login successful",
            data: {
                user: userData,
                sessionId: session.id,
                expiresAt: session.expiresAt,
                token: responseData.data.token,
            },
        });
    } catch (error) {
        console.error("❌ LOGIN API - Error:", error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to connect to authentication server",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
