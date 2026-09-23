import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
    process.env.SESSION_SECRET
);

const COOKIE_NAME = "duitku_session";

export async function createSession(userId: number) {
    const token = await new SignJWT({
        userId,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);

    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secret);

        return {
            userId: Number(payload.userId),
        };
    } catch {
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_NAME);
}