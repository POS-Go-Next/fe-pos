// app/api/auth/fingerprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSession, type AppUser } from "@/lib/auth";
import { cookies } from "next/headers";

const API_BASE_URL = "https://api-pos.masivaguna.com/api";

interface FingerprintLoginRequest {
  device_id: string;
  need_generate_token?: boolean;
  type?: string;
}

interface FingerprintLoginResponse {
  message: string;
  data?: {
    user: {
      id: number;
      username: string;
      fullname: string;
      email: string;
      phone: string;
      role_id: number;
      position_id: number;
    };
    token?: string;
  };
  errors?: Record<string, string[]>;
}

export async function POST(request: NextRequest) {
  try {
    const body: FingerprintLoginRequest = await request.json();

    if (!body.device_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Device ID is required",
        },
        { status: 400 }
      );
    }
    const payload: Record<string, unknown> = {
      device_id: body.device_id,
      need_generate_token: body.need_generate_token ?? true,
      test_print: true,
    };

    if (body.type) {
      payload.type = body.type;
    }

    const response = await fetch(`${API_BASE_URL}/login/fingerprint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData: FingerprintLoginResponse = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Fingerprint login failed",
          errors: responseData.errors,
        },
        { status: response.status }
      );
    }

     if (
       responseData.message === "Fingerprint login successful" &&
       responseData.data
     ) {
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
       // Only set auth-token cookie for login types that should persist the session
       // Do NOT set for return_confirmation type to preserve the current user's session
       const shouldSetAuthCookie = body.type !== "return_confirmation";
       
       if (responseData.data.token && shouldSetAuthCookie) {
         cookieStore.set("auth-token", responseData.data.token, {
           httpOnly: true,
           secure: process.env.NODE_ENV === "production",
           sameSite: "lax",
           maxAge: 60 * 60 * 24 * 7,
           path: "/",
         });
       }

      return NextResponse.json(
        {
          success: true,
          message: "Fingerprint login successful",
          data: {
            user: {
              id: apiUser.id,
              fullname: apiUser.fullname,
              username: apiUser.username,
              email: apiUser.email,
              phone: apiUser.phone,
              role_id: apiUser.role_id,
              position_id: apiUser.position_id,
            },
            sessionId: session.id,
            expiresAt: session.expiresAt,
            token: responseData.data.token,
          },
        },
        { status: 200 }
      );
    }

     if (responseData.message === "Login successful" && responseData.data) {
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
       // Only set auth-token cookie for login types that should persist the session
       // Do NOT set for return_confirmation type to preserve the current user's session
       const shouldSetAuthCookie = body.type !== "return_confirmation";
       
       if (responseData.data.token && shouldSetAuthCookie) {
         cookieStore.set("auth-token", responseData.data.token, {
           httpOnly: true,
           secure: process.env.NODE_ENV === "production",
           sameSite: "lax",
           maxAge: 60 * 60 * 24 * 7,
           path: "/",
         });
       }

      return NextResponse.json(
        {
          success: true,
          message: "Fingerprint login successful",
          data: {
            user: {
              id: apiUser.id,
              fullname: apiUser.fullname,
              username: apiUser.username,
              email: apiUser.email,
              phone: apiUser.phone,
              role_id: apiUser.role_id,
              position_id: apiUser.position_id,
            },
            sessionId: session.id,
            expiresAt: session.expiresAt,
            token: responseData.data.token,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: responseData.message || "Fingerprint login failed",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ FINGERPRINT API - Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to fingerprint authentication server",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during fingerprint login",
      },
      { status: 500 }
    );
  }
}
