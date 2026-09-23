import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// =============================================
// FR-TRX-02 — GET /api/transactions
// Lihat semua transaksi milik user yang login
// Urutkan terbaru dulu (ORDER BY transaction_date DESC)
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
            `SELECT id, type, amount, category, description, transaction_date, created_at, updated_at
             FROM transactions
             WHERE user_id = $1
             ORDER BY transaction_date DESC, created_at DESC`,
            [user.id]
        );

        return NextResponse.json({ transactions: result.rows });
    } catch (error) {
        console.error("GET /api/transactions error:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data transaksi" },
            { status: 500 }
        );
    }
}

// =============================================
// FR-TRX-01 — POST /api/transactions
// Tambah transaksi baru
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
        const { type, amount, category, description, transaction_date } = body;

        // =============================================
        // FR-TRX-05 — Validasi input
        // =============================================
        const errors: string[] = [];

        // Validasi type: hanya 'income' atau 'expense'
        if (!type || !["income", "expense"].includes(type)) {
            errors.push("Jenis transaksi harus 'income' atau 'expense'");
        }

        // Validasi amount: harus angka > 0
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            errors.push("Jumlah harus angka lebih dari 0");
        }

        // Validasi transaction_date: tidak boleh kosong, format valid
        if (!transaction_date) {
            errors.push("Tanggal transaksi wajib diisi");
        } else {
            const dateObj = new Date(transaction_date);
            if (isNaN(dateObj.getTime())) {
                errors.push("Format tanggal tidak valid");
            }
        }

        if (errors.length > 0) {
            return NextResponse.json(
                { error: errors.join(", ") },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, type, amount, category, description, transaction_date, created_at, updated_at`,
            [
                user.id,
                type,
                parsedAmount,
                category || null,
                description || null,
                transaction_date,
            ]
        );

        return NextResponse.json(
            { transaction: result.rows[0] },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/transactions error:", error);
        return NextResponse.json(
            { error: "Gagal menambah transaksi" },
            { status: 500 }
        );
    }
}
