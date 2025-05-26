// lib/auth.ts
import { Lucia, TimeSpan, type Adapter, type DatabaseSession, type DatabaseUser } from "lucia";
import { cookies } from "next/headers";

// User interface for our app
export interface AppUser {
  id: string;
  username: string;
  name?: string;
  role?: string;
  email?: string;
}

// Simple adapter for external API authentication
class SimpleAdapter implements Adapter {
  async getSessionAndUser(sessionId: string): Promise<[DatabaseSession | null, DatabaseUser | null]> {
    // Since we're using external API, we'll store minimal session data
    // In a real implementation, you'd fetch from your database
    return [null, null];
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    return [];
  }

  async setSession(session: DatabaseSession): Promise<void> {
    // Store session data if needed
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    // Update session expiration if needed
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Delete session if needed
  }

  async deleteUserSessions(userId: string): Promise<void> {
    // Delete all user sessions if needed
  }

  async deleteExpiredSessions(): Promise<void> {
    // Cleanup expired sessions if needed
  }
}

// Lucia configuration
export const lucia = new Lucia(
  new SimpleAdapter(),
  {
    sessionCookie: {
      name: "apotek-session",
      expires: false,
      attributes: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
    sessionExpiresIn: new TimeSpan(7, "d"), // 7 days
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
        name: attributes.name,
        role: attributes.role,
        email: attributes.email,
      };
    },
  }
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<AppUser, "id">;
  }
}

// Helper functions
export async function createSession(userId: string, userData: AppUser) {
  const session = await lucia.createSession(userId, userData);
  const sessionCookie = lucia.createSessionCookie(session.id);
  
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  
  return session;
}

export async function validateRequest() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null
    };
  }

  const result = await lucia.validateSession(sessionId);
  
  // Next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
  } catch {}
  
  return result;
}

export async function invalidateSession() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}