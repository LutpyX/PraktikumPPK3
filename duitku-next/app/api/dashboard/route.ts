import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await getDashboardData(user.id, user.name);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server saat mengambil data dashboard." },
            { status: 500 }
        );
    }
}
