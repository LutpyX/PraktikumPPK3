import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PREFERENCE_COOKIE = "duitku_theme";
const THIRTY_DAYS = 30 * 24 * 60 * 60;

export async function GET() {
    const cookieStore = await cookies();
    const theme = cookieStore.get(PREFERENCE_COOKIE)?.value || "light";

    return NextResponse.json({ theme });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { theme } = body;

        if (theme !== "light" && theme !== "dark") {
            return NextResponse.json(
                { message: "Theme harus 'light' atau 'dark'." },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        cookieStore.set(PREFERENCE_COOKIE, theme, {
            httpOnly: false, // readable by client JS for theme switching
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: THIRTY_DAYS,
            path: "/",
        });

        return NextResponse.json({
            message: "Preferensi tema berhasil diperbarui.",
            theme,
        });
    } catch (error) {
        console.error("Preference error:", error);

        return NextResponse.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}
