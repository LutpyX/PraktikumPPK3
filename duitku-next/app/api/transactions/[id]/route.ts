import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// =============================================
// FR-TRX-03 — PUT /api/transactions/:id
// Ubah transaksi milik sendiri
// WAJIB cek kepemilikan: transaksi ini milik user yang login?
// =============================================
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);

    if (isNaN(transactionId)) {
        return NextResponse.json(
            { error: "ID transaksi tidak valid" },
            { status: 400 }
        );
    }

    try {
        // Cek kepemilikan: transaksi harus milik user yang login
        const existing = await pool.query(
            `SELECT id, user_id FROM transactions WHERE id = $1`,
            [transactionId]
        );

        if (existing.rows.length === 0) {
            return NextResponse.json(
                { error: "Transaksi tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existing.rows[0].user_id !== user.id) {
            return NextResponse.json(
                { error: "Anda tidak memiliki akses ke transaksi ini" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { type, amount, category, description, transaction_date } = body;

        // =============================================
        // FR-TRX-05 — Validasi input
        // =============================================
        const errors: string[] = [];

        if (!type || !["income", "expense"].includes(type)) {
            errors.push("Jenis transaksi harus 'income' atau 'expense'");
        }

        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            errors.push("Jumlah harus angka lebih dari 0");
        }

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
            `UPDATE transactions
             SET type = $1, amount = $2, category = $3, description = $4, transaction_date = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND user_id = $7
             RETURNING id, type, amount, category, description, transaction_date, created_at, updated_at`,
            [
                type,
                parsedAmount,
                category || null,
                description || null,
                transaction_date,
                transactionId,
                user.id,
            ]
        );

        return NextResponse.json({ transaction: result.rows[0] });
    } catch (error) {
        console.error("PUT /api/transactions/:id error:", error);
        return NextResponse.json(
            { error: "Gagal mengubah transaksi" },
            { status: 500 }
        );
    }
}

// =============================================
// FR-TRX-04 — DELETE /api/transactions/:id
// Hapus transaksi milik sendiri (hard delete)
// WAJIB cek kepemilikan sebelum hapus
// =============================================
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);

    if (isNaN(transactionId)) {
        return NextResponse.json(
            { error: "ID transaksi tidak valid" },
            { status: 400 }
        );
    }

    try {
        // Cek kepemilikan: transaksi harus milik user yang login
        const existing = await pool.query(
            `SELECT id, user_id FROM transactions WHERE id = $1`,
            [transactionId]
        );

        if (existing.rows.length === 0) {
            return NextResponse.json(
                { error: "Transaksi tidak ditemukan" },
                { status: 404 }
            );
        }

        if (existing.rows[0].user_id !== user.id) {
            return NextResponse.json(
                { error: "Anda tidak memiliki akses ke transaksi ini" },
                { status: 403 }
            );
        }

        // Hard delete
        await pool.query(
            `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
            [transactionId, user.id]
        );

        return NextResponse.json({ message: "Transaksi berhasil dihapus" });
    } catch (error) {
        console.error("DELETE /api/transactions/:id error:", error);
        return NextResponse.json(
            { error: "Gagal menghapus transaksi" },
            { status: 500 }
        );
    }
}
