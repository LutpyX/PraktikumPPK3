import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
    process.env.SESSION_SECRET
);

const COOKIE_NAME = "duitku_session";

// Halaman yang membutuhkan login
const protectedPaths = ["/dashboard", "/transactions"];

// Halaman yang tidak boleh diakses jika sudah login
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    let isAuthenticated = false;

    if (token) {
        try {
            await jwtVerify(token, secret);
            isAuthenticated = true;
        } catch {
            // Token invalid atau expired
        }
    }

    // Jika mengakses halaman protected tanpa login -> redirect ke /login
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
        if (!isAuthenticated) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Jika sudah login dan mengakses /login atau /register -> redirect ke /dashboard
    if (authPaths.some((path) => pathname.startsWith(path))) {
        if (isAuthenticated) {
            return NextResponse.redirect(
                new URL("/dashboard", request.url)
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/transactions/:path*", "/login", "/register"],
};
