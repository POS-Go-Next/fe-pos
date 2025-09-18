import {
    Lucia,
    TimeSpan,
    type Adapter,
    type DatabaseSession,
    type DatabaseUser,
} from "lucia";
import { cookies } from "next/headers";

export interface AppUser {
    id: string;
    username: string;
    name?: string;
    role?: string;
    email?: string;
}

class SimpleAdapter implements Adapter {
    async getSessionAndUser(
        sessionId: string
    ): Promise<[DatabaseSession | null, DatabaseUser | null]> {
        return [null, null];
    }

    async getUserSessions(userId: string): Promise<DatabaseSession[]> {
        return [];
    }

    async setSession(session: DatabaseSession): Promise<void> {}

    async updateSessionExpiration(
        sessionId: string,
        expiresAt: Date
    ): Promise<void> {}

    async deleteSession(sessionId: string): Promise<void> {}

    async deleteUserSessions(userId: string): Promise<void> {}

    async deleteExpiredSessions(): Promise<void> {}
}

export const lucia = new Lucia(new SimpleAdapter(), {
    sessionCookie: {
        name: "apotek-session",
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        },
    },
    sessionExpiresIn: new TimeSpan(7, "d"),
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
            name: attributes.name,
            role: attributes.role,
            email: attributes.email,
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Omit<AppUser, "id">;
    }
}

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
            session: null,
        };
    }

    const result = await lucia.validateSession(sessionId);

    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
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
