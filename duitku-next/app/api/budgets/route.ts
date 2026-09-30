import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// =============================================
// FR-BDG-01 — GET /api/budgets
// Ambil semua budget milik user yang login
// Urutkan terbaru dulu (year DESC, month DESC)
// =============================================
export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const result = await pool.query(
            `SELECT id, month, year, amount, created_at, updated_at
             FROM budgets
             WHERE user_id = $1
             ORDER BY year DESC, month DESC`,
            [user.id]
        );

        return NextResponse.json({ budgets: result.rows });
    } catch (error) {
        console.error("GET /api/budgets error:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data budget" },
            { status: 500 }
        );
    }
}

// =============================================
// FR-BDG-02 — POST /api/budgets
// Tambah budget bulanan baru
// user_id diambil dari session (getCurrentUser), BUKAN dari input client
// =============================================
export async function POST(request: NextRequest) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { month, year, amount } = body;

        // =============================================
        // Validasi input
        // =============================================
        const errors: string[] = [];

        const parsedMonth = parseInt(month, 10);
        if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            errors.push("Bulan harus 1–12");
        }

        const parsedYear = parseInt(year, 10);
        if (isNaN(parsedYear) || parsedYear < 2020 || parsedYear > 2100) {
            errors.push("Tahun tidak valid");
        }

        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            errors.push("Jumlah anggaran harus lebih dari 0");
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", ") },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `INSERT INTO budgets (user_id, month, year, amount)
             VALUES ($1, $2, $3, $4)
             RETURNING id, month, year, amount, created_at, updated_at`,
            [user.id, parsedMonth, parsedYear, parsedAmount]
        );

        return NextResponse.json(
            { budget: result.rows[0] },
            { status: 201 }
        );
    } catch (error: any) {
        // Handle unique constraint violation (budget duplikat)
        if (error?.code === "23505") {
            return NextResponse.json(
                { error: "Budget untuk bulan dan tahun ini sudah ada" },
                { status: 409 }
            );
        }
        console.error("POST /api/budgets error:", error);
        return NextResponse.json(
            { error: "Gagal menambah budget" },
            { status: 500 }
        );
    }
}
